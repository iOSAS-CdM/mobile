/**
 * @typedef {import('./Record').RecordProps} DisciplinaryEventProps
 */
/**
 * @typedef {{ id: number | string }} EventProps
 */

/**
 * @typedef {{
 * 	id: number | string;
 * }} BaseEventProps
 */

/** @typedef {BaseEventProps & { type: 'disciplinary', content: DisciplinaryEventProps}} DisciplinaryEvent */
/** @typedef {BaseEventProps & { type: 'announcement', content: EventProps}} Event */

/** @typedef {DisciplinaryEvent |  Event} EventProps */

class Event {
	/**
	 * @param {EventProps} props
	 */
	constructor({
		id = Math.floor(Math.random() * 1000000),
		type,
		content
	}) {
		this.id = id;
		this.type = type;
		this.content = content;
	};
};

export default Event;