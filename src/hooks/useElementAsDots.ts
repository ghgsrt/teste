import html2canvas from 'html2canvas';
import { StepFn, StepConditionFn, useAnimation } from './useAnimation';
import { getRGBA } from '../utils/utils';

export type ShapeFn<R extends void | ((...args: any[]) => void) = void> = (
	context: CanvasRenderingContext2D,
	x: number,
	y: number,
	radius: number,
	color: string
) => R;
type CreateShape<R extends void | ((...args: any[]) => void) = void> = (
	x: number,
	y: number
) => ReturnType<ShapeFn<R>>;

type FillFn = (
	canvas: HTMLCanvasElement,
	shapeSize: number,
	shapeSpacing: number,
	bgColor: string
) => [number, number][][];

type StepArgs = [[number, number][][]];

export type DrawOptions<R extends void | ((...args: any[]) => void) = void> = {
	useAbsolute?: boolean;
	shapeSize?: number;
	modulateShapeSize?: (size: number) => number;
	shapeSpacing?: number;
	modulateShapeSpacing?: (spacing: number) => number;
	fill?: (shape: CreateShape<R>) => StepFn<StepArgs>;
	fillCondition?: StepConditionFn<StepArgs>;
	fillRate?: number;
	applyToShape?: (shape: CreateShape<R>) => CreateShape;
	stepFns?: [StepFn<StepArgs>, StepConditionFn<StepArgs>, number][];
};

// export type DrawFn<R> = <SR extends void | ((...args: any[]) => void)>(
// 	shapeFn: ShapeFn<SR>,
// 	fillFn: FillFn,
// 	options?: DrawOptions<SR>
// ) => R;
// export type DrawCleanup = () => void;

const circ = 2 * Math.PI;

export const dot =
	(
		context: CanvasRenderingContext2D,
		x: number,
		y: number,
		radius: number,
		fill: string
	) =>
	(alpha = 1) => {
		context.beginPath();
		context.globalAlpha = alpha;
		context.fillStyle = fill;
		context.arc(x, y, radius, 0, circ);
		context.fill();
		context.closePath();
	};

export function useElementAsDots(parent: HTMLElement, element: HTMLElement) {
	let play = () => {};
	let pause = () => {};
	let clean = () => {};

	const draw = async <R extends void | ((...args: any[]) => void)>(
		shapeFn: ShapeFn<R>,
		fillFn: FillFn,
		options?: DrawOptions<R>
	) => {
		const cleanup: (() => void)[] = [];

		const shapeSize = options?.shapeSize ?? 1;
		const shapeSpacing = options?.shapeSpacing ?? 1;
		const fillRate = options?.fillRate ?? 0;

		const modulateShapeSize = options?.modulateShapeSize ?? ((size) => size);

		await html2canvas(element).then((canvas) => {
			canvas.style.zIndex = '0';

			if (options?.useAbsolute) {
				canvas.style.position = 'absolute';
				canvas.style.top = '0';
				canvas.style.left = '0';
			}

			const path = fillFn(
				canvas,
				shapeSize,
				shapeSpacing,
				window.getComputedStyle(element).backgroundColor
			);

			const ctx = canvas.getContext('2d')!;
			const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
			ctx.putImageData(
				new ImageData(
					new Uint8ClampedArray(data.data.length),
					data.width,
					data.height
				),
				0,
				0
			);

			parent.appendChild(canvas);
			cleanup.push(canvas.remove.bind(canvas));

			const shape: CreateShape<R> = (x, y) =>
				shapeFn(
					ctx,
					parent.offsetLeft + x,
					parent.offsetTop + y,
					modulateShapeSize(shapeSize),
					getRGBA(data, x, y)
				);

			const fill =
				options?.fill?.(shape) ??
				((i) => {
					for (const [x, y] of path[i])
						(options?.applyToShape?.(shape) ?? shape)(x, y);
				});
			const fillCondition = options?.fillCondition ?? ((i) => i < path.length);

			if (options?.stepFns) {
				[play, pause] = useAnimation(
					[path],
					[fill, fillCondition, fillRate],
					...options.stepFns
				);

				play();
				cleanup.push(pause);
			} else for (let i = 0; i < path.length; i++) fill(i, path);
		});

		clean = () => {
			for (const fn of cleanup) fn();
		};
	};

	return {
		draw,
		play,
		pause,
		clean: () => clean(),
	};
}
