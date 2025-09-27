export interface MousePosition {
	timestamp: string;
	x: number;
	y: number;
}

export interface ClickEvent {
	id: string | number;
	timestamp: string;
	page?: string;
	x?: number;
	y?: number;
}

export interface TooltipProps {
	active?: boolean;
	payload?: Array<{
		payload: MousePosition;
	}>;
	label?: string;
}
