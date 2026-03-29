import React, { type ComponentType, FC, JSX } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { unified, PluggableList } from "unified";
import { VFile } from "vfile";
import { type Element, Root } from "hast";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { urlAttributes } from "html-url-attributes";
import { ExtraProps } from "react-markdown";
import { visit } from "unist-util-visit";
import remarkParse from "remark-parse";
import remarkRehype, { Options as RemarkRehypeOptions } from "remark-rehype";

type Components = {
	[Key in keyof JSX.IntrinsicElements]?: ComponentType<JSX.IntrinsicElements[Key] & ExtraProps> | keyof JSX.IntrinsicElements;
} & {
	[Key: string]: ComponentType<any & ExtraProps> | keyof JSX.IntrinsicElements;
};

type UrlTransform = (url: string, key: string, node: Readonly<Element>) => string | null | undefined;

export interface IdleMdPlugin {
	rehype?: PluggableList | null | undefined;
	remark?: PluggableList | null | undefined;
	components?: Components | null | undefined;
	preProcess: (markdown: string) => string;
}

interface PluginOptions {
	rehype?: PluggableList | null | undefined;
	remark?: PluggableList | null | undefined;
	idle?: IdleMdPlugin[];

	remarkRehypeOptions?: Readonly<RemarkRehypeOptions> | null | undefined;
}

interface IdleMarkdownProps {
	markdown: string;

	plugins?: PluginOptions | null | undefined;
	components?: Components | null | undefined;
	disallowedElements?: ReadonlyArray<string> | null | undefined;
	skipHtml?: boolean | null | undefined;
	unwrapDisallowed?: boolean | null | undefined;
	urlTransform?: UrlTransform | null | undefined;

	className?: string;
}

const SAFE_PROTOCOL = /^(https?|ircs?|mailto|xmpp)$/i;
const EMPTY_PLUGINS: PluggableList = [];
const EMPTY_REMARK_REHYPE_OPTIONS = { allowDangerousHtml: true };

function DEFAULT_URL_TRANSFORM(value: string) {
	const colon = value.indexOf(":");
	const questionMark = value.indexOf("?");
	const numberSign = value.indexOf("#");
	const slash = value.indexOf("/");

	if (colon === -1 ||
		(slash !== -1 && colon > slash) ||
		(questionMark !== -1 && colon > questionMark) ||
		(numberSign !== -1 && colon > numberSign) ||
		SAFE_PROTOCOL.test(value.slice(0, colon))) {
		return value;
	}

	return "";
}

function createProcessor(props: IdleMarkdownProps) {
	const options = props.plugins;

	let rehypePlugins = options?.rehype ?? EMPTY_PLUGINS;
	let remarkPlugins = options?.remark ?? EMPTY_PLUGINS;
	const remarkRehypeOptions = options?.remarkRehypeOptions
		? { ...options.remarkRehypeOptions, ...EMPTY_REMARK_REHYPE_OPTIONS }
		: EMPTY_REMARK_REHYPE_OPTIONS;

	if (options?.idle !== undefined) options.idle.forEach(plugin => {
		if (plugin.rehype) rehypePlugins = [ ...rehypePlugins, ...plugin.rehype ];
		if (plugin.remark) remarkPlugins = [ ...remarkPlugins, ...plugin.remark ];
	});

	return unified()
		.use(remarkParse)
		.use(remarkPlugins)
		.use(remarkRehype, remarkRehypeOptions)
		.use(rehypePlugins);
}

function createFile(markdown: string) {
	const file = new VFile();
	file.value = markdown;
	return file;
}

function post(tree: Root, props: IdleMarkdownProps) {
	let components = props.components ?? {};
	props.plugins?.idle?.forEach(plugin => {
		if (plugin.components) components = { ...components, ...plugin.components };
	})

	const disallowedElements = props.disallowedElements;
	const skipHtml = props.skipHtml;
	const unwrapDisallowed = props.unwrapDisallowed;
	const urlTransform = props.urlTransform ?? DEFAULT_URL_TRANSFORM;

	visit(tree, (node, index, parent) => {
		if (node.type === "raw" && parent && typeof index === "number") {
			if (skipHtml) parent.children.splice(index, 1);
			else parent.children[index] = { type: "text", value: node.value };
			return index;
		}

		if (node.type === "element") {
			// URL attributes
			for (const key in urlAttributes) {
				if (urlAttributes?.[key] === undefined || node.properties?.[key] === undefined) continue;
				const value = node.properties[key];
				const test = urlAttributes[key];
				if (test === null || test.includes(node.tagName)) {
					node.properties[key] = urlTransform(String(value || ""), key, node);
				}
			}

			// Disallowed elements
			const disallowed = disallowedElements
				? disallowedElements.includes(node.tagName)
				: false;
			if (disallowed && parent && typeof index === "number") {
				if (unwrapDisallowed && node.children) parent.children.splice(index, 1, ...node.children);
				else parent.children.splice(index, 1);
				return index;
			}
		}
	});

	return toJsxRuntime(tree, {
		Fragment: Fragment,
		components: components,
		ignoreInvalidStyle: true,
		jsx: jsx,
		jsxs: jsxs,
		passKeys: true,
		passNode: true
	})
}

const IdleMarkdown: FC<IdleMarkdownProps> = (props) => {
	let markdown = props.markdown;
	const className = props.className ?? "";

	if (props.plugins?.idle !== undefined) props.plugins.idle.forEach(value => {
		markdown = value.preProcess(markdown);
	});

	const processor = createProcessor(props);
	const file = createFile(markdown);

	const parsed = processor.parse(file);
	const tree = processor.runSync(parsed);

	const result = post(tree, props);

	return (
		<div className={`markdown-container ${className}`}>
			{ result }
		</div>
	);
}

export default IdleMarkdown;