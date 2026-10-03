import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { getMessages, type Messages } from '@/lib/messages';
import { createSectionComponents } from './lesson/sections';
import { createBlockComponents } from './lesson/blocks';
import { Check } from './lesson/check';

/** Component dùng được trong MDX. Chữ giao diện theo ngôn ngữ đang xem (`t`). */
export function getMDXComponents(t: Messages = getMessages('vi'), components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    ...createSectionComponents(t),
    ...createBlockComponents(t),
    Check,
    ...components,
  } satisfies MDXComponents;
}

export function useMDXComponents(components?: MDXComponents) {
  return getMDXComponents(undefined, components);
}

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
