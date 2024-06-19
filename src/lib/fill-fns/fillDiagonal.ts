import { shuffleArray, chunkArray, random, getRGBA } from '../../utils/utils';

export const fillDiagonal = (
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

	const depth = Math.floor((canvas.width + canvas.height - 2) / shapeSize);

	const queuePad = 3;
	const maxAvailQueues = 10;
	const randomOffset = 1;

	let queue: [number, number][][] = Array.from(
		{ length: queuePad + 1 },
		() => []
	);
	for (let i = 0; i < depth; i += shapeSpacing) {
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

		for (let x = Math.min(i, canvas.width - 1); x >= 0; x -= shapeSpacing) {
			const y = i - x;
			if (y < canvas.height && y >= 0) {
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
			} else if (y >= canvas.height) break;
		}

		if (_path.length === 0) continue;
		// if (_path.some(([x, y]) => y < 10)) console.log(_path);
		// if (_path.length < 4) continue;

		// path.push(_path);
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
