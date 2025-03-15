import { z } from 'zod';

/**
 * Arguments for listing Confluence spaces
 * Includes optional filters with defaults applied in the controller
 */
const ListSpacesToolArgs = z.object({
	type: z
		.enum(['global', 'personal', 'collaboration', 'knowledge_base'])
		.optional()
		.describe('Filter spaces by type (defaults to global)'),
	status: z
		.enum(['current', 'archived'])
		.optional()
		.describe('Filter spaces by status (defaults to current)'),
	limit: z.number().optional().describe('Limit the number of spaces returned'),
});

type ListSpacesToolArgsType = z.infer<typeof ListSpacesToolArgs>;

/**
 * Arguments for getting a specific Confluence space
 * This matches the controller implementation which takes only an ID parameter
 */
const GetSpaceToolArgs = z.object({
	id: z.string().describe('ID of the Confluence space to retrieve'),
});

type GetSpaceToolArgsType = z.infer<typeof GetSpaceToolArgs>;

export {
	ListSpacesToolArgs,
	type ListSpacesToolArgsType,
	GetSpaceToolArgs,
	type GetSpaceToolArgsType,
};
