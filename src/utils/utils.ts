import { createUniqueId } from 'solid-js';

export const deepCopy = (obj: Record<string, any>) =>
	JSON.parse(JSON.stringify(obj));

// export const deepMerge = <T extends Record<string, any>>(
// 	target: T,
// 	source: Partial<T>
// ) => {
// 	for (let key in target) {
// 		if (source[key] === undefined) continue;

// 		if ((source[key] as any) instanceof Object)
// 			target[key] = deepMerge(target[key], source[key]!);
// 		else target[key] = source[key]!;
// 	}

// 	return target;
// };
export const deepMerge = <T extends Record<string, any>>(
	target: T,
	source: Partial<T>
) => {
	if (!target) return source;
	for (let key in source) {
		// if (source[key] === undefined) continue;

		if ((source[key] as any) instanceof Object) {
			// target[key] ??= {};

			//@ts-ignore -- typescript sucks balls
			target[key] = deepMerge(target[key], source[key]!);
		} else target[key] = source[key]!;
	}

	return target;
};

export const mergeDefaults =
	<T>() =>
	<D extends Partial<T>>(defaultProps?: D) => {
		const defFns: Record<string, any> = {};

		if (defaultProps)
			for (const key in defaultProps)
				if (typeof defaultProps[key] === 'function')
					defFns[key] = defaultProps[key];

		return (props: Omit<T, keyof D>) => {
			const fns: Record<string, any> = {};

			// @ts-ignore
			for (const key in props)
				if (typeof props[key] === 'function') fns[key] = props[key];

			return {
				...defFns,
				...fns,
				id: createUniqueId(),
				...deepMerge(deepCopy(defaultProps ?? {}), deepCopy(props)),
			} as T;
		};
	};

export function shuffleArray(array: any[]) {
	for (var i = array.length - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i + 1));
		var temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}
}

export const random = (min: number, max: number) =>
	Math.random() * (max - min) + min;
export const randomInt = (min: number, max: number) =>
	Math.floor(random(min, max));

export function chunkArray<T>(array: T[], chunkSize: number) {
	const chunkedArr = [];
	for (let i = 0; i < array.length; i += chunkSize) {
		chunkedArr.push(array.slice(i, i + chunkSize));
	}
	return chunkedArr;
}

export const getRGBA = (data: ImageData, x: number, y: number) => {
	const offset = (Math.floor(y) * data.width + Math.floor(x)) * 4;

	return `rgba(${data.data[offset]}, ${data.data[offset + 1]}, ${
		data.data[offset + 2]
	}, ${data.data[offset + 3]})`;
};
