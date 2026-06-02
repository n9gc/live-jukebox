/**
 * 和 py 对接的类型
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'pylib/types';

import { getJsonCodec } from 'lib/types';
import { registerPylibTypes } from 'pylib/type-global';
import * as Schema from '../dist/lib-types';
import * as self from './types';

declare global {
	namespace PylibTypes {
		/**调度器 */
		export import main = self;
	}
}

registerPylibTypes('main', self);

/**调度器基本类型 @zod */
interface Base {
	/**服务所在的是主模块 */
	readonly service: 'main';
}

/**调度器返回值的基本类型 @zod */
interface BaseData extends Base {
	/**事件类型 */
	readonly event: string;
}

/**携带错误信息的 @zod */
interface WithTraceback {
	/**错误信息 */
	readonly info: string;
}

/**在操作其他服务时出现的 @zod */
interface FromService {
	/**来源模块 */
	readonly name: string;
}

/**没给调度器指定调用的函数 @zod */
export interface DataServiceNotProvided extends BaseData {
	readonly event: 'serviceNotProvided';
}
export import DataServiceNotProvided = Schema.DataServiceNotProvided;

/**出现未捕获错误 @zod */
export interface DataUncaught extends BaseData, WithTraceback, FromService {
	readonly event: 'uncaught';
}
export import DataUncaught = Schema.DataUncaught;

/**有一行无法解析的输入 @zod */
export interface DataBadInput extends BaseData, WithTraceback {
	readonly event: 'badInput';
	/**无法解析的输入行 */
	readonly line: string;
}
export import DataBadInput = Schema.DataBadInput;

/**输出的内容在被序列化的时候出错 @zod */
export interface DataJsonOutFailed extends BaseData, WithTraceback, FromService {
	readonly event: 'jsonOutFailed';
}
export import DataJsonOutFailed = Schema.DataJsonOutFailed;

/**找不到指定的模块 @zod */
export interface DataNoModule extends BaseData, WithTraceback, FromService {
	readonly event: 'noModule';
}
export import DataNoModule = Schema.DataNoModule;

/**模块没有导出服务 @zod */
export interface DataNoMain extends BaseData, FromService {
	readonly event: 'noMain';
	/**服务的路径 */
	readonly path: string;
}
export import DataNoMain = Schema.DataNoMain;

/**模块导出的不是服务 @zod */
export interface DataNotService extends BaseData, FromService {
	readonly event: 'notService';
	/**服务的路径 */
	readonly path: string;
}
export import DataNotService = Schema.DataNotService;

/**初始化服务示例时出错 @zod */
export interface DataBadInstance extends BaseData, WithTraceback, FromService {
	readonly event: 'badInstance';
}
export import DataBadInstance = Schema.DataBadInstance;


/**调用返回的数据 @zod */
export type Data
	= DataServiceNotProvided
	| DataUncaught
	| DataBadInput
	| DataJsonOutFailed
	| DataNoModule
	| DataNoMain
	| DataNotService
	| DataBadInstance;
export const Data = getJsonCodec(Schema.Data);

