/**
 * Types for Atlassian Confluence Spaces API
 */

/**
 * Space type enum
 */
export type SpaceType = 'global' | 'personal' | 'collaboration' | 'knowledge_base';

/**
 * Space status enum
 */
export type SpaceStatus = 'current' | 'archived';

/**
 * Space sort order enum
 */
export type SpaceSortOrder = 'id' | '-id' | 'key' | '-key' | 'name' | '-name';

/**
 * Space description object
 */
export interface SpaceDescription {
	plain?: {
		value: string;
		representation: string;
	};
	view?: {
		value: string;
		representation: string;
	};
}

/**
 * Space icon object
 */
export interface SpaceIcon {
	path?: string;
	apiDownloadLink?: string;
}

/**
 * Space links object
 */
export interface SpaceLinks {
	webui: string;
	base?: string;
}

/**
 * Label object
 */
export interface Label {
	id: string;
	name: string;
}

/**
 * Space property object
 */
export interface SpaceProperty {
	id: string;
	key: string;
	value: string;
}

/**
 * Operation object
 */
export interface Operation {
	operation: string;
	targetType: string;
}

/**
 * Permission subject object
 */
export interface PermissionSubject {
	type: 'user' | 'group';
	identifier: string;
}

/**
 * Space permission assignment object
 */
export interface SpacePermissionAssignment {
	id: string;
	subject: PermissionSubject;
	operation: Operation;
}

/**
 * Space role assignment object
 */
export interface SpaceRoleAssignment {
	id: string;
	role: string;
	subject: PermissionSubject;
}

/**
 * Optional field metadata
 */
export interface OptionalFieldMeta {
	hasMore: boolean;
}

/**
 * Optional field links
 */
export interface OptionalFieldLinks {
	next?: string;
}

/**
 * Space object returned from the API (basic fields)
 */
export interface Space {
	id: string;
	key: string;
	name: string;
	type: SpaceType;
	status: SpaceStatus;
	authorId: string;
	createdAt: string;
	homepageId: string;
	description?: SpaceDescription;
	icon?: SpaceIcon;
	_links: SpaceLinks;
	currentActiveAlias?: string;
}

/**
 * Extended space object with optional fields
 */
export interface SpaceDetailed extends Space {
	labels?: {
		results: Label[];
		meta: OptionalFieldMeta;
		_links: OptionalFieldLinks;
	};
	properties?: {
		results: SpaceProperty[];
		meta: OptionalFieldMeta;
		_links: OptionalFieldLinks;
	};
	operations?: {
		results: Operation[];
		meta: OptionalFieldMeta;
		_links: OptionalFieldLinks;
	};
	permissions?: {
		results: SpacePermissionAssignment[];
		meta: OptionalFieldMeta;
		_links: OptionalFieldLinks;
	};
	roleAssignments?: {
		results: SpaceRoleAssignment[];
		meta: OptionalFieldMeta;
		_links: OptionalFieldLinks;
	};
}

/**
 * Parameters for listing spaces
 */
export interface ListSpacesParams {
	ids?: string[];
	keys?: string[];
	type?: SpaceType;
	status?: SpaceStatus;
	labels?: string[];
	favoritedBy?: string;
	notFavoritedBy?: string;
	sort?: SpaceSortOrder;
	descriptionFormat?: 'plain' | 'view';
	includeIcon?: boolean;
	cursor?: string;
	limit?: number;
}

/**
 * Parameters for getting a space by ID
 */
export interface GetSpaceByIdParams {
	descriptionFormat?: 'plain' | 'view';
	includeIcon?: boolean;
	includeOperations?: boolean;
	includeProperties?: boolean;
	includePermissions?: boolean;
	includeRoleAssignments?: boolean;
	includeLabels?: boolean;
}

/**
 * API response for listing spaces
 */
export interface SpacesResponse {
	results: Space[];
	_links: {
		next?: string;
		base?: string;
	};
}
