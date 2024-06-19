import './reset.css';
import './App.css';
import DotElement, { DotFns } from './components/DotElement';
import { JSX, onMount } from 'solid-js';
import { createStore } from 'solid-js/store';
import { useTransOpacity } from './lib/anims/transOpacity';
import { random } from './utils/utils';
import { DrawOptions, dot } from './hooks/useElementAsDots';
import { fillDiagonal } from './lib/fill-fns/fillDiagonal';
import {
	fillDiagonal2,
	fillGroups,
	fillSwarm,
	fillSwarm2,
	groupPixels,
} from './lib/fill-fns/fillSwarm';

let element: HTMLDivElement;

const defDotFns = {
	draw: async () => console.log('uh oh!'),
	play: () => {},
	pause: () => {},
	clean: () => {},
};

function App() {
	const [test1, setTest1] = createStore<DotFns>({ ...defDotFns });
	const [test2, setTest2] = createStore<DotFns>({ ...defDotFns });

	const options = {
		useAbsolute: true,
		shapeSize: 2,
		shapeSpacing: 2,
		modulateShapeSize: (size: number) => (size + random(-0.2, 0.2)) / 2.2,
	};

	const noAnimDraw = (fns: DotFns) => {
		fns.draw(dot, fillDiagonal, {
			...options,
			applyToShape: (dot) => (x, y) => dot(x, y)(1),
		});
	};
	const animDraw = (fns: DotFns) => {
		const transition = useTransOpacity();

		// fillPath(diffused(withMany(asBloom(props))))
		// diffused(withMany(fillPath(asBloom(props))))
		fns.draw(dot, fillDiagonal2, {
			...options,
			applyToShape: transition.apply,
			stepFns: [
				[transition.step, (i, path) => i < path.length || !transition.done, 15],
			],
		});

		window.addEventListener('resize', () => {
			fns.clean();
			noAnimDraw(fns);
		});
	};

	onMount(() => {
		setTimeout(() => {
			animDraw(test1);
			animDraw(test2);
		}, 0);
	});

	window.addEventListener('click', () => {
		test1.clean();
		test2.clean();
	});

	return (
		<>
			<div class='App' style={styles.app}>
				{/* <div> */}
				<DotElement bind={setTest1}>
					<div
						ref={element}
						style={{
							// width: '100%',
							height: '100%',
							'text-align': 'center',
							'background-color': 'red',
							'font-size': '100px',
							display: 'flex',
							'align-items': 'center',
							'justify-content': 'center',
						}}
					>
						Deez Nuts
					</div>
				</DotElement>
				{/* </div>
				<div> */}
				<DotElement bind={setTest2}>
					<div
						ref={element}
						style={{
							// width: '100%',
							height: '100%',
							'text-align': 'center',
							'background-color': 'transparent',
							'font-size': '100px',
							display: 'flex',
							'align-items': 'center',
							'justify-content': 'center',
						}}
					>
						Deez Nuts
					</div>
				</DotElement>
				{/* </div> */}
			</div>
		</>
	);
}

const styles: Record<string, JSX.CSSProperties> = {
	app: {
		display: 'flex',
		// 'align-items': 'center',
		// 'justify-content': 'center',
		'flex-direction': 'row',
	},
};

export default App;
