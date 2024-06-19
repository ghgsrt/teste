import { Component, JSX, JSXElement, onMount } from 'solid-js';
import { useElementAsDots } from '../hooks/useElementAsDots';

export type DotFns = ReturnType<typeof useElementAsDots>;

type Props = {
	children: JSXElement;
	bind: (fns: DotFns) => void;
};

const DotElement: Component<Props> = (props) => {
	let parent: HTMLDivElement;
	let element: HTMLDivElement;

	onMount(() => props.bind(useElementAsDots(parent, element)));

	return (
		<div ref={parent} style={styles.parent}>
			<div ref={element} style={styles.wrapper}>
				{props.children}
			</div>
			<div style={styles.backdrop} />
		</div>
	);
};

const styles: Record<string, JSX.CSSProperties> = {
	parent: {
		position: 'relative',
		width: '100%',
		height: '100%',
		'background-color': 'var(--color-primary-background)',
	},
	wrapper: {
		width: '100%',
		height: '100%',
		position: 'absolute',
		'background-color': 'var(--color-primary-background)',

		top: '0',
		left: '0',
		'z-index': -2,
	},
	backdrop: {
		width: '100%',
		height: '100%',
		'background-color': 'var(--color-primary-background)',
		'font-size': '100px',
		opacity: 1,
		position: 'absolute',
		top: '0',
		left: '0',
		'z-index': -1,
	},
};

export default DotElement;
