/**
 * @typedef {{
 * 	type: 'staff',
 * 	user: import('./Staff').default
 * }} StaffAuthor
 */
/**
 * @typedef {{
 * 	type: 'student',
 * 	user: import('./Student').default
 * }} StudentAuthor
 */

/**
 * @typedef {{
 * 	id: Number | String,
 * 	title: String,
 * 	description: String,
 * 	cover: String,
 * 	content: String,
 * 	date: Date,
 * 	authors: (StaffAuthor | StudentAuthor)[],
 * 	archived?: Boolean,
 * 	images: HTMLImageElement[]
 * }} AnnouncementProps
 */

class Announcement {
	/**
	 * @param {AnnouncementProps} props
	 */
	constructor({
		id = Math.floor(Math.random() * 1000000),
		title,
		description,
		cover = '/Placeholder Image.svg',
		content = '',
		date = new Date(),
		authors = [],
		archived = false
	}) {
		this.id = id;
		this.title = title;
		this.description = description;
		this.cover = cover;
		this.content = content;
		this.date = date;
		this.authors = authors;
		this.archived = archived;
	};
};

export default Announcement;