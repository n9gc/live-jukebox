/**
 * 一些构建工具
 * @license MIT
 * @author n9gc
 */
declare module './manage.ts';

import { Project } from 'ts-morph';
import * as scripts from './manage.ts';
import configs from './ts-to-zod.config.mjs';


/**
 * 给所有 ts-to-zod 生成的 zod 类型都添加 `.meta({ id: 'xxx' })` 这样的元数据标记
 */
export async function metaType() {
	const project = new Project();
	for (const declaration of configs
		.map(n => n.output)
		.map(filePath => project.addSourceFileAtPath(filePath))
		.flatMap(source => source.getVariableDeclarations())
	) {
		const initializer = declaration.getInitializer();
		if (!initializer) continue;

		const name = declaration.getName();
		let initText = initializer.getText();
		initText += `.meta({ id: '${name}' })`;

		const disTag = declaration
			.getVariableStatement()
			?.getJsDocs()
			.flatMap(d => d.getTags())
			.findLast(tag => tag.getTagName() === 'discriminated');
		if (disTag) {
			initText = initText.replaceAll(
				'.union(',
				`.discriminatedUnion('${disTag.getCommentText()}', `,
			);
		}

		declaration.setInitializer(initText);
	}
	await project.save();
}


(
	(scripts as Partial<Record<string, () => void>>)[process.argv.at(-1) ?? '']
	?? (() => {
		throw new Error('What do you want to do?');
	})
)();
