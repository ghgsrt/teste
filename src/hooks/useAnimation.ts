export type StepFn<P extends any[]> = (i: number, ...args: P) => void;
export type StepConditionFn<P extends any[]> = (
	i: number,
	...args: P
) => boolean;

export function useAnimation<P extends any[]>(
	args: P[],
	...callbacks: [StepFn<P[]>, StepConditionFn<P[]>, number][]
) {
	const registry = Array.from({ length: callbacks.length }, () => [0, 0]);

	let rafId: number;
	const step = (elapsed: number) => {
		for (let c = 0; c < callbacks.length; c++) {
			if (elapsed - registry[c][1] > callbacks[c][2]) {
				const [_step, condition] = callbacks[c];

				if (condition(registry[c][0], ...args)) _step(registry[c][0], ...args);
				else callbacks.splice(c, 1);

				registry[c][0]++;
				registry[c][1] = elapsed;
			}
		}

		if (callbacks.length !== 0) rafId = requestAnimationFrame(step);
	};

	return [
		() => (rafId = requestAnimationFrame(step)),
		() => cancelAnimationFrame(rafId),
	];
}

// export type StepFn = (i: number, path: [number, number][][]) => void;
// export type StepConditionFn = (
// 	i: number,
// 	path: [number, number][][]
// ) => boolean;

// export function useAnimation(
// 	path: [number, number][][],
// 	...callbacks: [StepFn, StepConditionFn, number][]
// ) {
// 	const registry = Array.from({ length: callbacks.length }, () => [0, 0]);

// 	let rafId: number;
// 	const _step = (elapsed: number) => {
// 		for (let c = 0; c < callbacks.length; c++) {
// 			if (elapsed - registry[c][1] > callbacks[c][2]) {
// 				const [callback, condition] = callbacks[c];

// 				if (condition(registry[c][0], path)) callback(registry[c][0], path);
// 				else callbacks.splice(c, 1);

// 				registry[c][0]++;
// 				registry[c][1] = elapsed;
// 			}
// 		}

// 		if (callbacks.length !== 0) rafId = requestAnimationFrame(_step);
// 	};

// 	return [
// 		() => (rafId = requestAnimationFrame(_step)),
// 		() => cancelAnimationFrame(rafId),
// 	];
// }
