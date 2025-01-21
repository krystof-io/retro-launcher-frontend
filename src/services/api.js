// src/services/api.js

export async function fetchPlatforms() {
    try {
        const response = await fetch('/api/platforms');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching platforms:', error);
        throw error;
    }
}

export async function searchAuthors(query = '') {
    try {
        const response = await fetch(`/api/authors?search=${encodeURIComponent(query)}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Author search results:', data); // Added logging
        return data;
    } catch (error) {
        console.error('Error searching authors:', error);
        throw error;
    }
}

export async function fetchContentRatings() {
    try {
        const response = await fetch('/api/content-ratings');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching content ratings:', error);
        throw error;
    }
}

export async function fetchCurationStatuses() {
    try {
        const response = await fetch('/api/curation-statuses');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching curation statuses:', error);
        throw error;
    }
}

export async function fetchPrograms({
                                        titleSearch,
                                        platformId,
                                        platformBinaryId,
                                        curationStatus,
                                        contentRating,
                                        authorId,
                                        yearFrom,
                                        yearTo,
                                        sourceId,
                                        page = 0,
                                        size = 10,
                                        sortField = 'title',
                                        sortDirection = 'ASC'
                                    }) {
    try {
        // Build query parameters
        const params = new URLSearchParams();

        // Add search parameters if they exist
        if (titleSearch) params.append('titleSearch', titleSearch);
        if (platformId) params.append('platformId', platformId);
        if (platformBinaryId) params.append('platformBinaryId', platformBinaryId);
        if (curationStatus) params.append('curationStatus', curationStatus);
        if (contentRating) params.append('contentRating', contentRating);
        if (authorId) params.append('authorId', authorId);
        if (yearFrom) params.append('yearFrom', yearFrom);
        if (yearTo) params.append('yearTo', yearTo);
        if (sourceId) params.append('sourceId', sourceId);

        // Add pagination and sorting
        params.append('page', page);
        params.append('size', size);
        params.append('sortField', sortField);
        params.append('sortDirection', sortDirection);

        const response = await fetch(`/api/programs/search?${params.toString()}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return {
            content: data.content,
            totalElements: data.totalElements,
            totalPages: data.totalPages,
            number: data.number,
            size: data.size
        };
    } catch (error) {
        console.error('Error searching programs:', error);
        throw error;
    }
}

export async function fetchProgramById( id
                                      ) {
    try {
        // Build query parameters

        const response = await fetch(`/api/program/${id}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();

    } catch (error) {
        console.error('Error searching programs:', error);
        throw error;
    }
}

export async function updateProgram({
                                           id
                                       }) {
    try {
        // Build query parameters
        const params = new URLSearchParams();

        // Add search parameters if they exist
        if (titleSearch) params.append('titleSearch', titleSearch);
        if (platformId) params.append('platformId', platformId);
        if (curationStatus) params.append('curationStatus', curationStatus);
        if (contentRating) params.append('contentRating', contentRating);
        if (authorId) params.append('authorId', authorId);
        if (yearFrom) params.append('yearFrom', yearFrom);
        if (yearTo) params.append('yearTo', yearTo);

        // Add pagination and sorting
        params.append('page', page);
        params.append('size', size);
        params.append('sortField', sortField);
        params.append('sortDirection', sortDirection);

        const response = await fetch(`/api/program/search?${params.toString()}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return {
            content: data.content,
            totalElements: data.totalElements,
            totalPages: data.totalPages,
            number: data.number,
            size: data.size
        };
    } catch (error) {
        console.error('Error searching programs:', error);
        throw error;
    }
}