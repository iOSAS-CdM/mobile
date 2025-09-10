/**
 * @typedef {{
 * 	role: string,
 * 	student: import('./Student').StudentProps
 * }} OrganizationMember
 */

/**
 * @typedef {{
 * 	id?: number | string,
 * 	shortName: string,
 * 	fullName: string,
 * 	description: string,
 * 	email: string,
 * 	logo?: string,
 * 	cover?: string,
 * 	status?: 'active' | 'restricted' | 'archived',
 * 	type?: 'college-wide' | 'institute-wide',
 * 	members?: OrganizationMember[],
 * }} Organization
 */

class Organization {
	/**
	 * @param {Organization} props
	 */
	constructor({
		id = Math.floor(Math.random() * 1000000),
		shortName,
		fullName,
		description,
		email,
		logo = '/Placeholder Image.svg',
		cover = '/Placeholder Image.svg',
		status = 'active',
		type = 'college-wide',
		members = []
	}) {
		this.id = id;
		this.shortName = shortName;
		this.fullName = fullName;
		this.description = description;
		this.email = email;
		this.logo = logo;
		this.cover = cover;
		this.status = status;
		this.type = type;
		this.members = members;
	};
};

export default Organization;