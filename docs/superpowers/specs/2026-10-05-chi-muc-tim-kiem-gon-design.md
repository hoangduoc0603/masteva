# Chỉ mục tìm kiếm gọn cho hộp tìm nội dung bài (⌘K)

Ngày: 05/10/2026. Trạng thái: hướng "tài liệu gọn" đã được người dùng chọn; spec chờ duyệt.

## 1. Vấn đề

Hộp ⌘K tải `out/api/search`, một bản xuất cơ sở dữ liệu Orama (zbsearch) dựng lúc build bằng `createFromSource` của Fumadocs.

- Bản build E2E (`vi,en`): 16 MB, khoảng 3,3 MB gzip. Một nửa là bản tiếng Anh (trang `en` hiện bản tiếng Việt nên nội dung trùng y nguyên). Khoảng 35% là bảng `sort` mà hộp tìm không dùng.
- Chữ thật trong 64 bài tiếng Việt chỉ khoảng 0,84 MB (7.064 đoạn văn, 805 tiêu đề mục). Phần còn lại là phần phụ của định dạng xuất (bảng tần suất, ID nội bộ, bản sao từng tài liệu).
- Cloudflare Pages giới hạn 25 MiB mỗi file. Khi đủ ba roadmap (khoảng 200 bài), chỉ mục hiện tại vượt giới hạn và deploy lỗi. Người học cũng phải tải vài MB mỗi lần mở ⌘K.

## 2. Mục tiêu và tiêu chí xong

- Mỗi ngôn ngữ một file tài liệu gọn; hộp ⌘K của trang tiếng nào chỉ tải file tiếng đó, và chỉ tải khi người học mở hộp lần đầu.
- Với nội dung hiện tại, file `vi` dưới 500 KB gzip (ước tính khoảng 300 KB) và dưới 2 MB chưa nén.
- Kết quả tìm giữ nguyên chất lượng: cùng bộ tìm zbsearch, cùng tokenizer tiếng Việt (ADR-005), gõ không dấu vẫn ra bài có dấu.
- Hộp tìm vẫn là hộp của Fumadocs (giao diện, phím tắt, chuyển từ ô tìm trang chủ sang với từ khoá có sẵn).
- Không còn `out/api/search`.

## 3. Thiết kế

### 3.1 File tài liệu lúc build

Route handler tĩnh `src/app/[lang]/search.json/route.ts` (cùng kiểu với `topics.json`, ADR-008), `generateStaticParams` theo các ngôn ngữ đang bật, sinh `/<lang>/search.json`:

```json
{
  "v": 1,
  "pages": [
    {
      "url": "/vi/learn/d1/d1-1",
      "title": "Tiến trình, signal, systemd và journald",
      "crumbs": ["DevOps", "D1 Linux"],
      "headings": [["tien-trinh", "Tiến trình là gì"]],
      "texts": [["tien-trinh", "Mỗi chương trình đang chạy là một tiến trình…"]]
    }
  ]
}
```

- Nguồn là `source.getPages(lang)` và `page.data.structuredData` (`headings: {id, content}[]`, `contents: {heading?, content}[]`) mà Fumadocs đang dùng để dựng chỉ mục, nên nội dung được tìm không đổi.
- `crumbs` lấy từ ngữ cảnh bài (tên ngắn roadmap, mã và tên chặng), thay cho `["Docs", "<chặng>"]` hiện tại.
- Đoạn văn không thuộc tiêu đề mục nào có id rỗng `""`.
- Hàm thuần `buildSearchFile(pages)` trong `src/lib/search/lesson-index.ts` biến danh sách trang thành nội dung file; route chỉ gọi hàm này.

### 3.2 Dựng chỉ mục và tìm trên trình duyệt

`src/lib/search/lesson-client.ts` cung cấp `lessonSearchClient(locale)` theo giao diện `SearchClient` của Fumadocs (`search(query) => SortedResult[]`):

1. Lần tìm đầu: tải `/<locale>/search.json` (cache trong module, mỗi ngôn ngữ tải một lần; tải lỗi thì lần sau thử lại).
2. `toDocuments(file)` (hàm thuần) trải file thành tài liệu zbsearch: mỗi trang một tài liệu `page` (nội dung là tiêu đề), mỗi tiêu đề mục một tài liệu `heading` (url có `#id`), mỗi đoạn văn một tài liệu `text` (url có `#id` của mục chứa nó, nếu có).
3. Tạo DB zbsearch với schema `{ content, page_id, type, url }`, tokenizer `createVietnameseTokenizer()`, `sort` tắt, rồi `insertMultiple`.
4. Tìm theo `content`, lấy tối đa 60 kết quả, rồi `groupResults(hits, pages, query)` (hàm thuần) gom theo trang theo cách Fumadocs đang làm: dòng `page` của mỗi trang có kết quả, ngay sau là các dòng `heading`/`text` khớp của trang đó, trang có điểm cao nhất đứng trước. Mỗi dòng có `breadcrumbs`; phần khớp được tô bằng `createContentHighlighter(query).highlightMarkdown`.

`src/components/search.tsx` dùng `useDocsSearch({ client: lessonSearchClient(locale) })` thay cho `staticClient`. Phần điền sẵn từ khoá (`takeHandOff`) giữ nguyên.

### 3.3 Gỡ bỏ

- Xoá `src/app/api/search/route.ts`.
- Bỏ `staticClient` và `initDB` khỏi `search.tsx`.

## 4. Lỗi và trường hợp biên

- Tải file lỗi: hộp tìm hiện danh sách rỗng; lần gõ tiếp theo tải lại. Không ném lỗi làm hỏng trang.
- Từ khoá rỗng hoặc toàn dấu cách: trả `[]`, không tải file.
- Gõ nhanh nhiều ký tự trong lúc file đang tải: chỉ một request; các lần tìm chờ cùng một promise.
- Trang `en` chưa dịch: file `en` có nội dung tiếng Việt như hiện nay (giữ hành vi cũ).

## 5. Ngoài phạm vi

- Chia file theo roadmap (định dạng cho phép làm sau khi cần).
- Pagefind hay bộ máy tìm khác.
- Tìm nội dung bài từ ô trang chủ (đã có lối sang ⌘K).

## 6. Kiểm thử

- Unit (TDD, `src/lib/search`):
  - `buildSearchFile`: gom đúng tiêu đề, mục, đoạn văn không có mục; giữ thứ tự trang.
  - `toDocuments`: số tài liệu và url có `#id` đúng.
  - `groupResults`: trang đứng trước các dòng của nó, không lặp trang, trang điểm cao trước, có `breadcrumbs`.
  - `lessonSearchClient`: từ khoá không dấu "tien trinh" ra trang "Tiến trình…"; từ khoá rỗng không gọi `fetch`; hai lần tìm đồng thời chỉ gọi `fetch` một lần (dùng `fetch` giả).
- E2E:
  - giữ test "tìm kiếm không dấu ra bài có dấu" và test chuyển từ khoá từ trang chủ;
  - mở trang roadmap, chưa mở ⌘K thì không có request tới `search.json`; mở ⌘K và gõ thì có đúng một request tới `/vi/search.json`;
  - `/vi/search.json` dưới 2 MB; `/api/search` trả 404.

## 7. Tài liệu

- `docs/architecture.md`: thêm ADR-009 (chỉ mục gọn dựng trên trình duyệt; lý do, đánh đổi: lần mở ⌘K đầu tiên tốn thêm thời gian dựng chỉ mục); sửa đoạn §6/§11 nhắc `/api/search`.
- `docs/status.md`: cập nhật dung lượng chỉ mục trong "Vấn đề đã biết".
