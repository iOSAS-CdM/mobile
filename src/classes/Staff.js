/**
 * @typedef {{
 *  id: number | string;
 *  name: {
 * 		first: string;
 * 		last: string;
 * 		middle?: string;
 * 	};
 *  email: string;
 *  role: 'head' | 'guidance' | 'prefect' | 'student-affairs';
 *  profilePicture: string;
 *  status: 'active' | 'restricted' | 'archived';
 *  reason?: string;
 * }} StaffProps
 */

class Staff {
	/**
	 * @param {StaffProps} props
	 */
	constructor({
		id,
		name,
		email,
		role,
		profilePicture,
		status,
		reason
	}) {
		this.id = id;
		this.name = name;
		this.email = email;
		this.role = role;
		this.profilePicture = profilePicture;
		this.status = status;
		if (status === 'restricted') {
			this.reason = reason;
		}
	};
};

export default Staff;