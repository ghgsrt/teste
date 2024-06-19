export function useTransOpacity() {
	let transOpacityReg: [(alpha: number) => void, number][] = [];

	const step = () => {
		for (let i = 0; i < transOpacityReg.length; i++) {
			const item = transOpacityReg[i];

			item[1] = Math.min(item[1] + 0.15, 1);
			item[0](item[1]);

			if (item[1] === 1) transOpacityReg.splice(i, 1);
		}
	};

	const apply =
		(createFn: (x: number, y: number) => (alpha: number) => void) =>
		(x: number, y: number) => {
			transOpacityReg.push([createFn(x, y), 0]);
		};

	return {
		apply,
		step,
		get done() {
			return transOpacityReg.length === 0;
		},
	};
}
