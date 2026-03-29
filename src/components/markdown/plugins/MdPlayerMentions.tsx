import { type Root } from "mdast";
import { Plugin } from "unified";
import { findAndReplace } from "mdast-util-find-and-replace";
import { IdleMdPlugin } from "@components/markdown/IdleMarkdown.tsx";
import { ReactNode } from "react";
import PlayerMention from "@components/PlayerMention.tsx";

const TYPE = "PLAYER_MENTION"
const ESCAPE = `@@${TYPE}@@`;
const REGEX_PRE_PROCESS = /\\@([a-zA-Z0-9]+)/g
const REGEX_POST_PROCESS = new RegExp(`${ESCAPE}([a-zA-Z0-9]+)${ESCAPE}`, "g");
const REGEX = /(?<![a-zA-Z])@([a-zA-Z0-9]+)/g

const idleAtPlayerMention: (options: {
	element?: (name: string) => ReactNode
}) => IdleMdPlugin = ({
	element = (name) => <PlayerMention name={name} />
}) => {
	const preProcess = (markdown: string) =>
		markdown.replace(REGEX_PRE_PROCESS, (_, name) => `${ESCAPE}${name}${ESCAPE}`);

	const remarkAtPlayerMention: Plugin<void[], Root> = () => {
		return (tree, _file) => {
			findAndReplace(tree, [
				[REGEX, (value: string, username: string) => {
					const whitespace = [];

					if (value.indexOf("@") > 0) {
						whitespace.push({
							type: "text",
							value: value.substring(0, value.indexOf("@"))
						});
					}

					return [
						...whitespace,
						{
							type: "mention",
							value: username,
							data: {
								hName: TYPE,
								hProperties: {
									"data-type": TYPE,
									"data-username": username,
								}
							},
						}
					] as any;
				}],

				[REGEX_POST_PROCESS, (_, name) => "@" + name]
			]);
		}
	}

	return {
		remark: [[remarkAtPlayerMention]],
		components: {
			[TYPE](props: any) {
				return element(props["data-username"])
			},
		},
		preProcess
	}
}

export default idleAtPlayerMention;
