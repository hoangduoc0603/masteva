import Link from 'next/link';
import { loadRoadmaps } from '@/lib/content/repo';
import { getMessages, format } from '@/lib/messages';
import type { Language } from '@/lib/i18n';
import type { Roadmap } from '@/lib/content/schema';

export function localized(value: Roadmap['title'], lang: Language): string {
  return value[lang] ?? value.vi;
}

/** Danh mục roadmap (FR-ROADMAP-001). Render lúc build. */
export function RoadmapCards({ lang }: { lang: Language }) {
  const t = getMessages(lang);
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {loadRoadmaps().map((roadmap) => (
        <li key={roadmap.id}>
          <Link
            href={`/${lang}/roadmaps/${roadmap.id}`}
            className="flex h-full flex-col gap-2 rounded-xl border bg-fd-card p-5 transition-colors hover:bg-fd-accent"
          >
            <span className="text-xs font-medium uppercase tracking-wide text-fd-muted-foreground">
              {roadmap.area} · {format(t.roadmaps.steps, { count: roadmap.steps.length })}
            </span>
            <span className="text-lg font-semibold">{localized(roadmap.title, lang)}</span>
            <span className="text-sm text-fd-muted-foreground">{localized(roadmap.description, lang)}</span>
            <span className="mt-auto pt-2 text-sm font-medium text-fd-primary">{t.roadmaps.open} →</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
