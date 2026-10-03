import { loader } from 'fumadocs-core/source';
import { defineDocs } from 'fumadocs-mdx/macro';
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';
import { i18n } from './i18n';
import { lessonFields, refineLesson, stepFields } from './content/schema';

export const learnRoute = '/learn';

const steps = defineDocs({
  dir: 'content/steps',
  docs: {
    schema: pageSchema.extend(lessonFields).superRefine(refineLesson),
  },
  meta: {
    schema: metaSchema.extend(stepFields),
  },
});

// See https://fumadocs.dev/docs/headless/source-api
export const source = loader({
  baseUrl: learnRoute,
  source: steps.toFumadocsSource(),
  i18n,
});

export type LessonPage = NonNullable<ReturnType<typeof source.getPage>>;
