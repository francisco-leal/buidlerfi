import {fetchQueryWithPagination} from '@airstack/node';
import {FetchQuery, Variables} from "@airstack/node/dist/types/types";
import {DocumentNode} from "@apollo/client/core";

/**
 * Fetch all the pages related to a query on Airstack
 * @param query - the GraphQL query to perform
 * @param variables - the variables to include in the query
 */
export const fetchAllPagesQuery = async <T>(query: DocumentNode, variables?: Variables): Promise<T[]> => {
    const allData: T[] = [];

    // Fetch the first page of data
    // TODO: figure out why this weird typing is needed
    let response: FetchQuery | undefined | null = await fetchQueryWithPagination(gqlToString(query), variables);

    // Handle error for the first page
    if (response.error) {
        console.error(response.error);
        await delay(1000);
        return fetchAllPagesQuery(query, variables);
    }

    // Store the data from the first page
    allData.push(response.data);

    // Determine whether to fetch the next page
    let shouldFetchNextPage = response.hasNextPage;

    // Counter to track the number of API calls
    // let numCalls = 1;

    // Fetch subsequent pages until there are no more pages
    while (shouldFetchNextPage) {
        // Fetch the next page of data
        response = await response!.getNextPage();

        // Break the loop if there's an error fetching the next page
        if (response?.error) {
            break;
        }

        // Update the flag to determine whether to continue fetching
        shouldFetchNextPage = response!.hasNextPage;

        // Store the data from the current page
        allData.push(response?.data);
        // console.log(allData.length)
    }

    return allData;
}

// eslint-disable-next-line no-promise-executor-return
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const gqlToString = (gqlQuery: DocumentNode): string => gqlQuery.loc?.source.body || '';
