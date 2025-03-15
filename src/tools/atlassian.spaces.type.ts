import { z } from 'zod';

/**
 * Arguments for listing Confluence spaces
 * This matches the controller implementation which currently takes no parameters
 */
const ListSpacesToolArgs = z.object({});

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
