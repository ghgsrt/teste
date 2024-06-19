import { Tuple } from '../../types/utils';
import { chunkArray, random, randomInt } from '../../utils/utils';

const particle = <N extends number>(
	dimensions: N,
	objectiveFn: (pos: Tuple<number, N>, i: number) => number,
	startPosFn: () => number,
	startVelFn: () => number,
	updateHiveMind: (position: Tuple<number, N>) => void
) => {
	const position = Array.from({ length: dimensions }, startPosFn) as Tuple<
		number,
		N
	>;
	let velocity = Array.from({ length: dimensions }, startVelFn) as Tuple<
		number,
		N
	>;
	let bestPosition = position;
	let bestValue = objectiveFn(position, 0);
	updateHiveMind([...position] as Tuple<number, N>);

	const constantVelocityMagnitude = 5;

	const updatePosition = () => {
		for (let i = 0; i < dimensions; i++) {
			position[i] += velocity[i];
		}
		updateHiveMind([...position] as Tuple<number, N>);
	};

	const normalizeVelocity = () => {
		const magnitude = Math.sqrt(velocity.reduce((sum, v) => sum + v * v, 0));
		if (magnitude > 0) {
			velocity = velocity.map(
				(v) => (v / magnitude) * constantVelocityMagnitude
			) as Tuple<number, N>;
		}
	};
	normalizeVelocity();
	const updateVelocity = (
		globalBest: Tuple<number, N>,
		inertia: number,
		cognitive: number,
		social: number
	) => {
		// Compute new velocity direction based on personal and global bests
		// const personalInfluence = bestPosition.map((best, i) => best - position[i]);
		// const globalInfluence = globalBest.map(
		// 	(globalBest, i) => globalBest - position[i]
		// );

		// // Calculate a weighted average of the influences
		// const combinedInfluence = personalInfluence.map(
		// 	(p, i) => (p + globalInfluence[i]) / 2
		// );

		// // Normalize direction
		// let norm = Math.sqrt(
		// 	combinedInfluence.reduce((acc, val) => acc + val * val, 0)
		// );
		// if (norm === 0) {
		// 	// If the norm is 0, apply a small random adjustment
		// 	velocity = velocity
		// 		.map(() => constantVelocityMagnitude * (Math.random() - 0.5))
		// 		.map((v) => 2 * v) as Tuple<number, N>;
		// 	norm = Math.sqrt(velocity.reduce((acc, val) => acc + val * val, 0));
		// 	velocity = velocity.map(
		// 		(v) => (v / norm) * constantVelocityMagnitude
		// 	) as Tuple<number, N>;
		// } else {
		// 	// Normalize and apply the constant magnitude
		// 	velocity = combinedInfluence.map(
		// 		(v) => (v / norm) * constantVelocityMagnitude
		// 	) as Tuple<number, N>;
		// }
		// // Calculate weighted directions towards personal best and global best positions
		// const r1 = Math.random();
		// const r2 = Math.random();
		// const cognitiveComponent = bestPosition.map(
		// 	(p, i) => r1 * (p - position[i])
		// );
		// const socialComponent = globalBest.map((p, i) => r2 * (p - position[i]));

		// // Combine the components to form a new direction vector
		// const newDirection = cognitiveComponent.map(
		// 	(c, i) => c + socialComponent[i]
		// );

		// // Normalize the new direction vector and apply constant magnitude
		// const magnitude = Math.sqrt(
		// 	newDirection.reduce((sum, v) => sum + v * v, 0)
		// );
		// if (magnitude === 0) {
		// 	// In the rare case the magnitude is zero (e.g., when the particle is exactly at the target),
		// 	// we randomly perturb the direction to ensure movement.
		// 	velocity = velocity
		// 		.map(() => (Math.random() - 0.5) * 2)
		// 		.map((v) => v * constantVelocityMagnitude) as Tuple<number, N>;
		// } else {
		// 	velocity = newDirection.map(
		// 		(v) => (v / magnitude) * constantVelocityMagnitude
		// 	) as Tuple<number, N>;
		// }
		// const newDirection = velocity.map((v, i) => {
		// 	// Compute a new direction based on the personal best and global best positions
		// 	const personalComponent = bestPosition[i] - position[i];
		// 	const socialComponent = globalBest[i] - position[i];
		// 	return personalComponent + socialComponent;
		// });

		// // Calculate the magnitude of the new direction vector
		// const magnitude = Math.sqrt(
		// 	newDirection.reduce((sum, v) => sum + v * v, 0)
		// );
		// // Normalize the new direction vector to have the constant velocity magnitude
		// velocity = (
		// 	magnitude > 0
		// 		? newDirection.map((v) => (v / magnitude) * constantVelocityMagnitude)
		// 		: velocity
		// ) as Tuple<number, N>;

		for (let i = 0; i < dimensions; i++) {
			const r1 = Math.random();
			const r2 = Math.random();

			const personalBestVelocity =
				cognitive * r1 * (bestPosition[i] - position[i]);
			const globalBestVelocity = social * r2 * (globalBest[i] - position[i]);

			velocity[i] =
				inertia * velocity[i] + personalBestVelocity + globalBestVelocity;
		}
		// for (let i = 0; i < dimensions; i++) {
		// 	velocity[i] =
		// 		inertia * velocity[i] +
		// 		cognitive * Math.random() * (bestPosition[i] - position[i]) +
		// 		social * Math.random() * (globalBest[i] - position[i]);
		// }
	};

	const updateBest = (i: number) => {
		const value = objectiveFn(position, i);
		if (value < bestValue) {
			bestValue = value;
			bestPosition = position;
		}
	};

	return {
		position,
		velocity,
		bestPosition,
		bestValue,
		updatePosition,
		updateVelocity,
		updateBest,
	};
};

export const PSO = <N extends number>(
	particleCount: number,
	dimensions: N,
	objectiveFn: (pos: Tuple<number, N>, i: number) => number,
	terminationFn: (i: number, bestValue: number) => boolean
) => {
	const path: Tuple<number, N>[][] = [[]];

	const particles = Array.from({ length: particleCount }, (_, i) =>
		particle(
			dimensions,
			objectiveFn,
			() => Math.random() * 1000 - 500,
			// () =>
			// 	random(
			// 		-Math.random() - i * Math.random(),
			// 		Math.random() + i * Math.random()
			// 	),
			Math.random,
			(position) => path[path.length - 1].push(position)
		)
	);
	let globalBestPosition = [...particles[0].position] as Tuple<number, N>;
	let globalBestValue = particles[0].bestValue;

	const updateGlobalBest = () => {
		for (let i = 0; i < particleCount; i++) {
			if (particles[i].bestValue < globalBestValue) {
				globalBestValue = particles[i].bestValue;
				globalBestPosition = [...particles[i].bestPosition] as Tuple<number, N>;
			}
		}
	};

	const step = (
		iter: number,
		inertia: number,
		cognitive: number,
		social: number
	) => {
		path.push([]);

		for (let i = 0; i < particleCount; i++) {
			particles[i].updateVelocity(
				globalBestPosition,
				inertia,
				cognitive,
				social
			);
			particles[i].updatePosition();
			particles[i].updateBest(iter);
		}
		updateGlobalBest();
	};

	let i = 1;
	while (!terminationFn(i, globalBestValue)) {
		step(i, 0.99, 0.5, 0.5);
		i++;
	}

	return path;
};

const toTarget = (targetPoint: number[]) => {
	let _targetPoint = [...targetPoint];
	return (position: number[]): number => {
		let distance = 0;
		for (let i = 0; i < position.length; i++) {
			distance += (position[i] - (_targetPoint[i] += random(-1, 1))) ** 2;
		}
		return Math.sqrt(distance);
	};
};

export const fillSwarm = (
	canvas: HTMLCanvasElement,
	shapeSize: number,
	shapeSpacing: number,
	bgColor: string
) => {
	const ctx = canvas.getContext('2d')!;
	const data = ctx.getImageData(0, 0, canvas.width, canvas.height);

	const depth = Math.floor((canvas.width + canvas.height - 2) / shapeSize);

	const path = PSO(
		50,
		2,
		// ([x, y]) => {
		// 	return data.data.length - (y * canvas.width + x);
		// },
		// (pos) => {
		// 	return pos.reduce((sum, x) => sum + x * x, 0)
		// },
		toTarget([canvas.width / 2, canvas.height / 2]),
		// (x, t) => {
		// 	const movingMinX = Math.sin(t / 10) * 5;
		// 	const movingMinY = Math.cos(t / 10) * 5;
		// 	return (
		// 		(x[0] - movingMinX) * (x[0] - movingMinX) +
		// 		(x[1] - movingMinY) * (x[1] - movingMinY)
		// 	);
		// },
		(i, bestValue) => i > 10000
	);

	console.log(path);

	// for (let i = 0; i < path.length; i++) {
	// 	const [x, y] = path[i][0];
	// 	ctx.fillRect(x, y, shapeSize, shapeSize);
	// }

	return path;
};

type PixelGroup = Array<[number, number]>;
type VisitedSet = Set<string>;

function getPixelIndex(x: number, y: number, width: number): number {
	return (y * width + x) * 4;
}

function colorsMatch(
	color1: [number, number, number, number],
	color2: [number, number, number, number]
): boolean {
	return color1.every((val, index) => val === color2[index]);
}

function floodFill(
	imageData: ImageData,
	bgColor: [number, number, number, number],
	startX: number,
	startY: number,
	visited: VisitedSet
): PixelGroup {
	const { width, height, data } = imageData;
	const stack: PixelGroup = [[startX, startY]];
	const pixelGroup: PixelGroup = [];
	const startColor: Tuple<number, 4> = [
		data[getPixelIndex(startX, startY, width)],
		data[getPixelIndex(startX, startY, width) + 1],
		data[getPixelIndex(startX, startY, width) + 2],
		data[getPixelIndex(startX, startY, width) + 3],
	];

	while (stack.length > 0) {
		const [x, y] = stack.pop()!;
		const index = getPixelIndex(x, y, width);
		const color: Tuple<number, 4> = [
			data[index],
			data[index + 1],
			data[index + 2],
			data[index + 3],
		];

		if (colorsMatch(color, bgColor)) continue;

		if (
			x < 0 ||
			y < 0 ||
			x >= width ||
			y >= height ||
			visited.has(`${x},${y}`) ||
			!colorsMatch(color, startColor)
		) {
			continue;
		}

		visited.add(`${x},${y}`);
		pixelGroup.push([x, y]);

		// Add neighboring pixels (4-directionally) to the stack
		stack.push([x + 1, y]);
		stack.push([x - 1, y]);
		stack.push([x, y + 1]);
		stack.push([x, y - 1]);
	}

	return pixelGroup;
}

export function groupPixels(
	imageData: ImageData,
	bgColor: string
): PixelGroup[] {
	const groups: PixelGroup[] = [];
	const visited: VisitedSet = new Set();

	const ignore = bgColor
		.slice(bgColor.indexOf('(') + 1, -1)
		.split(', ')
		.map(Number) as Tuple<number, 4>;
	ignore[3] = ignore[3] * 255 || 255;

	for (let y = 0; y < imageData.height; y++) {
		for (let x = 0; x < imageData.width; x++) {
			if (!visited.has(`${x},${y}`)) {
				const group = floodFill(imageData, ignore, x, y, visited);
				if (group.length > 0) {
					groups.push(group);
				}
			}
		}
	}

	return groups;
}

export function fillGroups(
	canvas: HTMLCanvasElement,
	shapeSize: number,
	shapeSpacing: number,
	bgColor: string
) {
	const ctx = canvas.getContext('2d')!;
	const data = ctx.getImageData(0, 0, canvas.width, canvas.height);

	const _groups = groupPixels(data, bgColor);
	const groups: typeof _groups = [];
	for (const group of _groups) {
		if (group.length > 100) {
			groups.push(...(chunkArray(group, 100) as (typeof group)[]));
		} else {
			groups.push(group);
		}
	}

	// for (const group of groups) {
	// 	const { x, y } = group[0];
	// 	ctx.fillRect(x, y, shapeSize, shapeSize);
	// }

	return groups as [number, number][][];
}

import { shuffleArray, getRGBA } from '../../utils/utils';

export const fillDiagonal2 = (
	canvas: HTMLCanvasElement,
	shapeSize: number,
	shapeSpacing: number,
	bgColor: string
) => {
	let path: [number, number][][] = [];

	let [bgR, bgG, bgB, bgA] = bgColor
		.slice(bgColor.indexOf('(') + 1, -1)
		.split(', ');
	bgA = (Number(bgA) * 255 || 255).toString();
	console.log(bgColor, bgR, bgG, bgB, bgA);

	const data = canvas
		.getContext('2d')!
		.getImageData(0, 0, canvas.width, canvas.height);

	// const _groups = groupPixels(data, bgColor);
	// const groups: typeof _groups = [];
	// for (const group of _groups) {
	// 	if (group.length > 10) {
	// 		groups.push(...(chunkArray(group, 100) as (typeof group)[]));
	// 	} else {
	// 		groups.push(group);
	// 	}
	// }

	const height = Math.floor(canvas.height / shapeSpacing);
	const width = Math.floor(canvas.width / shapeSpacing);

	const grid = Array.from({ length: width }, () => Array(height).fill(false));

	// const groups: [number, number][][] = [];
	// let unvisited: [number, number][] = [[0, 0]];
	// let group: [[number, number][], [number, number][]];
	// while (true) {
	// 	group = iterativeDFSLimitedBreadth(grid, unvisited.pop()!, 10, 5);

	// 	if (group[0].length !== 0) groups.push(group[0]);
	// 	if (group[1].length !== 0) unvisited.push(...group[1]);

	// 	if (unvisited.length === 0) break;
	// 	else unvisited = unvisited.filter((pos) => !grid[pos[0]][pos[1]]);
	// }
	// const visitedSet = new Set<string>(); // Track visited points as strings "x,y"
	// const groups: [number, number][][] = [];
	// const unvisited: [number, number][] = [[0, 0]];

	// const numSearchers = 5;
	// const searchers: [
	// 	Set<[number, number][]>,
	// 	Set<string>,
	// 	[number, number][]
	// ][] = Array.from({ length: numSearchers }, () => [
	// 	new Set<[number, number][]>(),
	// 	new Set<string>(),
	// 	[[0, 0]],
	// ]);

	const numSearchers = 15;
	// const searchers: [Set<[number, number]>, [number, number][]][] = Array.from(
	// 	{ length: numSearchers },
	// 	() => [new Set<[number, number]>(), [[0, 0]]]
	// );
	const searchers: [number, number][][] = Array.from(
		{ length: numSearchers },
		() => []
	);
	const unvisitedSet = new Set<string>(
		Array.from({ length: width }, (_, x) =>
			Array.from(
				{ length: height },
				(_, y) =>
					`${Math.min(
						x * shapeSpacing,
						canvas.width - (canvas.width % shapeSpacing)
					)},${Math.min(
						y * shapeSpacing,
						canvas.height - (canvas.height % shapeSpacing)
					)}`
			)
		).flat()
	);
	console.log(unvisitedSet);
	const unvisited: [number, number][] = [[0, 0]];
	console.log('visiting');
	while (unvisitedSet.size > 0) {
		// console.log('deez');
		for (const groups of searchers) {
			if (unvisited.length === 0) {
				if (unvisitedSet.size > 0) {
					const head = unvisitedSet.values().next().value;

					unvisited.push(head.split(',').map(Number));
					unvisitedSet.delete(head);
				} else continue;
			}
			// if (unvisited.length === 0) continue;

			const group = temp(grid, unvisited.pop()!, shapeSpacing);
			// iterativeDFSLimitedBreadth(
			// 	grid,
			// 	unvisited.pop()!,
			// 	randomInt(2, 5),
			// 	randomInt(15, 25),
			// 	random(0.75, 1)
			// );
			// const group = simulateSemiCircularBloom(
			// 	grid,
			// 	unvisited.pop()!,
			// 	randomInt(10, 20)
			// );

			for (const point of group[0]) {
				if (unvisitedSet.delete(`${point[0]},${point[1]}`)) groups.push(point);
			}
			for (const point of group[1]) {
				if (unvisitedSet.delete(`${point[0]},${point[1]}`))
					unvisited.push(point);
			}
		}
	}

	const groups = searchers.map((groups) => chunkArray(Array.from(groups), 20));

	const depth = Math.max(...groups.map((group) => group.length));

	const queuePad = 3;
	const maxAvailQueues = 10;
	const randomOffset = 1;

	let queue: [number, number][][] = Array.from(
		{ length: queuePad + 1 },
		() => []
	);
	console.log('filling');
	for (let i = 0; i < depth; i += 1) {
		const _path: [number, number][] = [];

		if (i > queuePad) {
			const availQueues = Math.max(
				Math.min(maxAvailQueues, i, depth - i - queuePad),
				0
			);

			const temp = queue.flat();
			shuffleArray(temp);
			queue = chunkArray(temp, temp.length / availQueues);
			shuffleArray(queue);

			if (queue.length > availQueues) _path.push(...queue.pop()!);
			else {
				if (queue.length < availQueues) queue.unshift([]);

				if (queue.length > 0) {
					const queueIdx = Math.floor(Math.random() * queue.length);
					_path.push(...queue[queueIdx]);
					queue[queueIdx] = [];
				}
			}
		}

		for (const group of groups) {
			if (!group[i]) continue;

			for (const [x, y] of group[i]) {
				const _randomOffset = random(-randomOffset, randomOffset);
				// const _randomOffset = 2;
				const _x = x * shapeSize + _randomOffset;
				const _y = y * shapeSize + _randomOffset;

				if (_x < 0 || _y < 0 || _x > canvas.width || _y > canvas.height)
					continue;

				const [r, g, b, a] = getRGBA(data, _x, _y).slice(5, -1).split(', ');
				if (r === bgR && g === bgG && b === bgB && a === bgA) continue;

				if (
					queue.length > 0 &&
					i > queuePad &&
					i < depth - queuePad &&
					Math.random() > 0.1
				) {
					queue[Math.floor(Math.random() * queue.length)].push([_x, _y]);
				} else _path.push([_x, _y]);
			}
		}

		if (_path.length === 0) continue;

		shuffleArray(_path);
		let chunks = chunkArray(_path, _path.length / 10);
		shuffleArray(chunks);
		chunks = chunkArray(chunks.flat(), _path.length / 1.25);
		shuffleArray(chunks);
		const moreChunks = chunkArray(chunks, chunks.length / 2);
		shuffleArray(moreChunks);
		chunks = moreChunks.flat();
		for (const chunk of chunks) path.push(chunk);
	}

	return path;
};

const directions: Coordinate[] = [
	[-1, 0],
	[1, 0],
	[0, -1],
	[0, 1], // Orthogonal directions
	[-1, -1],
	[-1, 1],
	[1, -1],
	[1, 1], // Diagonal directions
];
const temp = (
	visited: boolean[][],
	point: [number, number],
	spacing: number
): [[number, number][], [number, number][]] => {
	const x = point[0] / spacing;
	const y = point[1] / spacing;

	if (visited?.[x]?.[y] === undefined) console.log(point);
	visited[x][y] = true;

	const next: [number, number][] = [];
	for (const direction of directions) {
		const _next: [number, number] = [
			x + direction[0] * spacing,
			y + direction[1] * spacing,
		];
		if (
			_next[0] >= 0 &&
			_next[0] < visited.length &&
			_next[1] >= 0 &&
			_next[1] < visited[0].length &&
			visited[_next[0]][_next[1]] === false
		) {
			next.push(_next);
			visited[_next[0]][_next[1]] = true;
		}
	}

	return [[point], next];
};

type FillOptions = {
	shapeSize: number;
	shapeSpacing: number;
};

export const fillBloom2 = (
	canvas: HTMLCanvasElement,
	options: FillOptions
) => {};

export const fillBloom = (
	canvas: HTMLCanvasElement,
	shapeSize: number,
	shapeSpacing: number,
	bgColor: string
) => {
	let path: [number, number][][] = [];

	let [bgR, bgG, bgB, bgA] = bgColor
		.slice(bgColor.indexOf('(') + 1, -1)
		.split(', ');
	bgA = (Number(bgA) * 255 || 255).toString();
	console.log(bgColor, bgR, bgG, bgB, bgA);

	const data = canvas
		.getContext('2d')!
		.getImageData(0, 0, canvas.width, canvas.height);

	const grid = Array.from({ length: canvas.width }, () =>
		Array(canvas.height).fill(false)
	);

	const numSearchers = 15;
	const searchers: [number, number][][] = Array.from(
		{ length: numSearchers },
		() => []
	);
	const unvisitedSet = new Set<string>(
		Array.from({ length: canvas.width }, (_, x) =>
			Array.from({ length: canvas.height }, (_, y) => `${x},${y}`)
		).flat()
	);
	const unvisited: [number, number][] = [[0, 0]];
	console.log('visiting');
	while (unvisitedSet.size > 0) {
		for (const groups of searchers) {
			if (unvisited.length === 0) continue;

			const group = iterativeDFSLimitedBreadth(
				grid,
				unvisited.pop()!,
				randomInt(2, 5),
				randomInt(15, 25),
				random(0.75, 1)
			);

			for (const point of group[0]) {
				if (unvisitedSet.delete(`${point[0]},${point[1]}`)) groups.push(point);
			}
			for (const point of group[1]) {
				if (unvisitedSet.delete(`${point[0]},${point[1]}`))
					unvisited.push(point);
			}
		}
	}

	const groups = searchers.map((groups) => chunkArray(Array.from(groups), 20));

	const depth = Math.max(...groups.map((group) => group.length));

	const queuePad = 3;
	const maxAvailQueues = 10;
	const randomOffset = 1;

	let queue: [number, number][][] = Array.from(
		{ length: queuePad + 1 },
		() => []
	);
	console.log('filling');
	for (let i = 0; i < depth; i += 1) {
		const _path: [number, number][] = [];

		if (i > queuePad) {
			const availQueues = Math.max(
				Math.min(maxAvailQueues, i, depth - i - queuePad),
				0
			);

			const temp = queue.flat();
			shuffleArray(temp);
			queue = chunkArray(temp, temp.length / availQueues);
			shuffleArray(queue);

			if (queue.length > availQueues) _path.push(...queue.pop()!);
			else {
				if (queue.length < availQueues) queue.unshift([]);

				if (queue.length > 0) {
					const queueIdx = Math.floor(Math.random() * queue.length);
					_path.push(...queue[queueIdx]);
					queue[queueIdx] = [];
				}
			}
		}

		for (const group of groups) {
			if (!group[i]) continue;

			for (const [x, y] of group[i]) {
				const _randomOffset = random(-randomOffset, randomOffset);
				const _x = x * shapeSize + _randomOffset;
				const _y = y * shapeSize + _randomOffset;

				if (_x < 0 || _y < 0 || _x > canvas.width || _y > canvas.height)
					continue;

				const [r, g, b, a] = getRGBA(data, _x, _y).slice(5, -1).split(', ');
				if (r === bgR && g === bgG && b === bgB && a === bgA) continue;

				if (
					queue.length > 0 &&
					i > queuePad &&
					i < depth - queuePad &&
					Math.random() > 0.1
				) {
					queue[Math.floor(Math.random() * queue.length)].push([_x, _y]);
				} else _path.push([_x, _y]);
			}
		}

		if (_path.length === 0) continue;

		shuffleArray(_path);
		let chunks = chunkArray(_path, _path.length / 10);
		shuffleArray(chunks);
		chunks = chunkArray(chunks.flat(), _path.length / 1.25);
		shuffleArray(chunks);
		const moreChunks = chunkArray(chunks, chunks.length / 2);
		shuffleArray(moreChunks);
		chunks = moreChunks.flat();
		for (const chunk of chunks) path.push(chunk);
	}

	return path;
};

// Define the optimization problem
interface Problem {
	dimensions: number;
	lowerBound: number[];
	upperBound: number[];
	objectiveFunction: (position: number[], i: number) => number;
}

// Particle structure
class Particle {
	position: number[];
	velocity: number[];
	bestPosition: number[];
	bestScore: number;

	constructor(public problem: Problem) {
		this.position = new Array(problem.dimensions)
			.fill(0)
			.map(
				(_, i) =>
					problem.lowerBound[i] +
					Math.random() * (problem.upperBound[i] - problem.lowerBound[i])
			);
		this.velocity = new Array(problem.dimensions)
			.fill(0)
			.map(() => Math.random() * 2 - 1);
		this.bestPosition = [...this.position];
		this.bestScore = Infinity;
	}

	update(globalBestPosition: number[], iter: number) {
		const inertiaWeight = 0.5;
		const personalBestWeight = 0.3;
		const globalBestWeight = 0.2;

		for (let i = 0; i < this.problem.dimensions; i++) {
			// Update velocity
			this.velocity[i] =
				inertiaWeight * this.velocity[i] +
				personalBestWeight *
					Math.random() *
					(this.bestPosition[i] - this.position[i]) +
				globalBestWeight *
					Math.random() *
					(globalBestPosition[i] - this.position[i]);

			// Update position
			this.position[i] += this.velocity[i];

			// Ensure the particle stays within bounds
			if (this.position[i] < this.problem.lowerBound[i])
				this.position[i] = this.problem.lowerBound[i];
			if (this.position[i] > this.problem.upperBound[i])
				this.position[i] = this.problem.upperBound[i];
		}

		// Update the best score and position
		const score = this.problem.objectiveFunction(this.position, iter);
		if (score < this.bestScore) {
			this.bestScore = score;
			this.bestPosition = [...this.position];
		}
	}
}

// PSO Algorithm
class ParticleSwarmOptimization {
	particles: Particle[];
	globalBestPosition: number[];
	globalBestScore: number;
	path: Tuple<number, 2>[][] = [[]];

	constructor(public problem: Problem, public numberOfParticles: number = 30) {
		this.particles = new Array(numberOfParticles)
			.fill(null)
			.map(() => new Particle(problem));
		this.globalBestPosition = new Array(problem.dimensions).fill(0);
		this.globalBestScore = Infinity;

		// Initialize global best
		this.particles.forEach((particle) => {
			if (particle.bestScore < this.globalBestScore) {
				this.globalBestScore = particle.bestScore;
				this.globalBestPosition = [...particle.bestPosition];
			}
		});
	}

	optimize(iterations: number) {
		for (let iter = 0; iter < iterations; iter++) {
			this.path.push([]);
			this.particles.forEach((particle) => {
				particle.update(this.globalBestPosition, iter);
				this.path[this.path.length - 1].push([...particle.position] as Tuple<
					number,
					2
				>);
				// Update global best if necessary
				if (particle.bestScore < this.globalBestScore) {
					this.globalBestScore = particle.bestScore;
					this.globalBestPosition = [...particle.bestPosition];
				}
			});
		}
	}
}

export const fillSwarm2 = (
	canvas: HTMLCanvasElement,
	shapeSize: number,
	shapeSpacing: number,
	bgColor: string
) => {
	const pso = new ParticleSwarmOptimization(
		{
			dimensions: 2,
			lowerBound: [0, 0],
			upperBound: [canvas.width, canvas.height],
			objectiveFunction: (x, t) => {
				const movingMinX = Math.sin(t / 1) * 105;
				const movingMinY = Math.cos(t / 1) * 105;
				// return (
				// 	(x[0] - movingMinX) * (x[0] - movingMinX) +
				// 	(x[1] - movingMinY) * (x[1] - movingMinY)
				// );
				return random(
					0,
					// (x[0] - movingMinX) * (x[0] - movingMinX) ,
					canvas.width * canvas.height
				);
			},
			// toTarget([canvas.width / 2, canvas.height / 2]),
			// hiveMindFn: (pos) => path[path.length - 1].push(pos),
		},
		25
	);
	pso.optimize(10000);

	return pso.path;
};

// const directions = [
// 	[1, 0],
// 	[-1, 0],
// 	[0, 1],
// 	[0, -1],
// ]; // Down, Up, Right, Left

type Point = [number, number];
type Grid = boolean[][];
function iterativeDFSLimitedBreadth(
	visited: Grid,
	start: Point,
	maxDepth: number,
	maxBreadth: number,
	bfsThreshold: number
): [Point[], Point[]] {
	const rows = visited.length;
	const cols = visited[0].length;

	let stack: [Point, number][] = [[start, 0]];
	const path: Point[] = [];
	let lastUnvisitedNeighbors: Point[] = [];

	let breadthCounter: number[] = new Array(maxDepth + 1).fill(0);

	while (stack.length > 0) {
		const [point, depth] = stack.pop()!;
		const [x, y] = point;

		if (
			x < 0 ||
			y < 0 ||
			x >= rows ||
			y >= cols ||
			visited[x][y] ||
			depth > maxDepth
		)
			continue;

		if (breadthCounter[depth] >= maxBreadth) continue; // Skip if max breadth reached at this depth

		visited[x][y] = true;
		path.push([x, y]);
		breadthCounter[depth]++;

		if (depth === maxDepth) {
			for (const [dx, dy] of directions) {
				const newX = x + dx;
				const newY = y + dy;
				if (
					newX >= 0 &&
					newY >= 0 &&
					newX < visited.length &&
					newY < visited[0].length &&
					!visited[newX][newY]
				)
					lastUnvisitedNeighbors.push([newX, newY]);
			}
			continue;
		}

		for (const [dx, dy] of directions) {
			stack[Math.random() < bfsThreshold ? 'unshift' : 'push']([
				[x + dx, y + dy],
				depth + 1,
			]);
		}
	}

	return [path, lastUnvisitedNeighbors];
}

// function getUnvisitedNeighbors(
// 	x: number,
// 	y: number,
// 	visited: boolean[][]
// ): Point[] {
// 	const neighbors: Point[] = [];

// 	for (const [dx, dy] of directions) {
// 		const newX = x + dx;
// 		const newY = y + dy;
// 		if (
// 			newX >= 0 &&
// 			newY >= 0 &&
// 			newX < visited.length &&
// 			newY < visited[0].length &&
// 			!visited[newX][newY]
// 		)
// 			neighbors.push([newX, newY]);
// 	}

// 	return neighbors;
// }
// function iterativeDFS(
// 	visited: Grid,
// 	start: Point,
// 	maxDepth: number
// ): [Point[], Point[]] {
// 	const stack: { point: Point; depth: number }[] = [{ point: start, depth: 0 }];
// 	const path: Point[] = [];
// 	let lastUnvisitedNeighbors: Point[] = [];

// 	const directions = [
// 		[1, 0],
// 		[-1, 0],
// 		[0, 1],
// 		[0, -1],
// 	]; // Down, Up, Right, Left

// 	while (stack.length > 0) {
// 		const { point, depth } = stack.pop()!;
// 		const [x, y] = point;

// 		if (
// 			x < 0 ||
// 			y < 0 ||
// 			x >= visited.length ||
// 			y >= visited[0].length ||
// 			(visited[x]?.[y] ?? true) ||
// 			depth > maxDepth
// 		)
// 			continue;

// 		visited[x][y] = true;
// 		path.push([x, y]);

// 		if (depth === maxDepth) {
// 			lastUnvisitedNeighbors = getUnvisitedNeighbors(x, y, visited);
// 			continue;
// 		}

// 		for (const [dx, dy] of directions) {
// 			const nextX = x + dx;
// 			const nextY = y + dy;
// 			stack.push({ point: [nextX, nextY], depth: depth + 1 });
// 		}
// 	}

// 	return [path, lastUnvisitedNeighbors];
// }

// function getUnvisitedNeighbors(
// 	x: number,
// 	y: number,
// 	visited: boolean[][]
// ): Point[] {
// 	const neighbors: Point[] = [];
// 	const directions = [
// 		[1, 0],
// 		[-1, 0],
// 		[0, 1],
// 		[0, -1],
// 	]; // Down, Up, Right, Left

// 	for (const [dx, dy] of directions) {
// 		const newX = x + dx;
// 		const newY = y + dy;
// 		if (
// 			newX >= 0 &&
// 			newY >= 0 &&
// 			newX < visited.length &&
// 			newY < visited[0].length &&
// 			!visited[newX][newY]
// 		) {
// 			neighbors.push([newX, newY]);
// 		}
// 	}

// 	return neighbors;
// }

// type Cell = [number, number];
// type Grid = boolean[][]; // Assuming a grid of visited (true) or unvisited (false) cells

// function dfsWithMaxDepth(
// 	visited: Grid,
// 	startX: number,
// 	startY: number,
// 	maxDepth: number
// ): [Cell, Cell[]] | null {
// 	const rows = visited.length;
// 	const cols = visited[0].length;
// 	// let visited: boolean[][] = Array.from({ length: rows }, () =>
// 	// 	Array(cols).fill(false)
// 	// );
// 	let path: Cell[] = []; // To keep track of the cells visited in the current path
// 	let _path: Cell[] = []; // To keep track of the cells visited in the current path

// 	// Function to get adjacent, unvisited cells
// 	function getUnvisitedAdjacentCells(x: number, y: number): Cell[] {
// 		const adjacents: Cell[] = [];
// 		const directions = [
// 			[1, 0],
// 			[-1, 0],
// 			[0, 1],
// 			[0, -1],
// 		]; // Right, Left, Down, Up
// 		for (let [dx, dy] of directions) {
// 			const newX = x + dx;
// 			const newY = y + dy;
// 			if (
// 				newX >= 0 &&
// 				newX < rows &&
// 				newY >= 0 &&
// 				newY < cols &&
// 				!visited[newX][newY]
// 			) {
// 				adjacents.push([newX, newY]);
// 			}
// 		}
// 		return adjacents;
// 	}

// 	// The DFS function with depth limit
// 	function dfs(x: number, y: number, depth: number): boolean {
// 		if (x < 0 || x >= rows || y < 0 || y >= cols || visited[x][y]) return false;
// 		visited[x][y] = true;
// 		path.push([x, y]);
// 		_path.push([x, y]);

// 		if (depth === maxDepth) return true; // Reached max depth

// 		// Explore adjacent cells
// 		for (let adj of getUnvisitedAdjacentCells(x, y)) {
// 			if (dfs(...adj, depth + 1)) return true;
// 		}

// 		path.pop(); // Backtrack
// 		return false;
// 	}

// 	// Start DFS and handle the case when max depth is reached
// 	if (dfs(startX, startY, 0)) {
// 		// Find a random unvisited adjacent cell to any cell in the path
// 		let allUnvisitedAdjacents: Cell[] = [];
// 		for (let cell of path) {
// 			allUnvisitedAdjacents = allUnvisitedAdjacents.concat(
// 				getUnvisitedAdjacentCells(...cell)
// 			);
// 		}

// 		if (allUnvisitedAdjacents.length > 0) {
// 			// Return a random unvisited adjacent cell
// 			const randomIndex = Math.floor(
// 				Math.random() * allUnvisitedAdjacents.length
// 			);
// 			return [allUnvisitedAdjacents[randomIndex], _path];
// 		}
// 	}

// 	return null; // In case there's no unvisited adjacent cell or DFS didn't start
// }

type Coordinate = [number, number];

function simulateSemiCircularBloom(
	visited: boolean[][],
	start: Coordinate,
	depth: number
): [Coordinate[], Coordinate[]] {
	// Initialize data structures
	const row = visited.length;
	const col = visited[0].length;
	const path: Coordinate[] = [];
	const adjacentCells: Coordinate[] = [];

	// Mark the starting point as visited and add it to the path
	visited[start[0]][start[1]] = true;
	path.push(start);

	// Define the queue for BFS and add the starting point
	const queue: { coord: Coordinate; currentDepth: number }[] = [
		{ coord: start, currentDepth: 0 },
	];

	// Process the queue
	while (queue.length > 0) {
		const { coord, currentDepth } = queue.shift()!;

		// Calculate adjacent cells only at the final depth
		if (currentDepth === depth - 1) {
			getAdjacentCells(coord, row, col).forEach((adjacent) => {
				if (!visited[adjacent[0]][adjacent[1]]) {
					adjacentCells.push(adjacent);
				}
			});
		}

		// Continue expanding if the current depth is less than the max depth
		if (currentDepth < depth) {
			getExpansionCandidates(coord, start, visited).forEach((nextCoord) => {
				if (!visited[nextCoord[0]][nextCoord[1]]) {
					visited[nextCoord[0]][nextCoord[1]] = true;
					path.push(nextCoord);
					queue.push({ coord: nextCoord, currentDepth: currentDepth + 1 });
				}
			});
		}
	}

	return [path, adjacentCells];
}

function getExpansionCandidates(
	current: Coordinate,
	start: Coordinate,
	visited: boolean[][]
): Coordinate[] {
	const row = visited.length;
	const col = visited[0].length;
	const directions: Coordinate[] = [
		[-1, 0],
		[1, 0],
		[0, -1],
		[0, 1], // Orthogonal directions
		[-1, -1],
		[-1, 1],
		[1, -1],
		[1, 1], // Diagonal directions
	];
	const candidates: Coordinate[] = [];

	for (let i = 0; i < directions.length; i++) {
		const dx = directions[i][0];
		const dy = directions[i][1];
		const nextCoord: Coordinate = [current[0] + dx, current[1] + dy];

		if (isValid(nextCoord, row, col) && !visited[nextCoord[0]][nextCoord[1]]) {
			// Calculate angle between start and nextCoord
			const angle =
				Math.atan2(nextCoord[1] - start[1], nextCoord[0] - start[0]) *
				(180 / Math.PI);
			// Adjust angle to be within the range [0, 360]
			const adjustedAngle = angle < 0 ? angle + 360 : angle;
			// Determine if the angle falls within the desired semicircular range
			// Assuming the semicircle is facing right (0 to 180 degrees)
			if (adjustedAngle >= 0 && adjustedAngle <= 180) {
				candidates.push(nextCoord);
			}
		}
	}

	return candidates;
}

// // This function would determine valid expansion candidates based on the desired semicircular shape
// function getExpansionCandidates(
// 	current: Coordinate,
// 	start: Coordinate,
// 	depth: number,
// 	row: number,
// 	col: number
// ): Coordinate[] {
// 	// Placeholder for logic to select candidates based on semicircular expansion criteria
// 	// This could involve geometric calculations to favor directions that align with the semicircle's curvature
// 	return []; // Implement the logic based on specific semicircular approximation criteria
// }

// Gets all valid adjacent cells for a given cell, considering grid boundaries
function getAdjacentCells(
	coord: Coordinate,
	row: number,
	col: number
): Coordinate[] {
	const [x, y] = coord;
	const directions: Coordinate[] = [
		[-1, 0],
		[1, 0],
		[0, -1],
		[0, 1], // Orthogonal directions
		[-1, -1],
		[-1, 1],
		[1, -1],
		[1, 1], // Diagonal directions
	];
	const adjacentCells: Coordinate[] = [];

	directions.forEach(([dx, dy]) => {
		const adjacent: Coordinate = [x + dx, y + dy];
		if (isValid(adjacent, row, col)) {
			adjacentCells.push(adjacent);
		}
	});

	return adjacentCells;
}

// Checks if a coordinate is within the grid boundaries
function isValid([x, y]: Coordinate, width: number, height: number): boolean {
	return x >= 0 && x < width && y >= 0 && y < height;
}
