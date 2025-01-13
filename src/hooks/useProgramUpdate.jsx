import { useState } from 'react';

export const useProgramUpdate = (initialProgram) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [program, setProgram] = useState(initialProgram);

    const updateProgram = async (id, updates) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/program/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updates)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const updatedProgram = await response.json();
            setProgram(updatedProgram);
            return updatedProgram;

        } catch (error) {
            setError(error.message);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const validateUpdates = (updates) => {
        const errors = {};

        // Required fields
        if (!updates.title?.trim()) {
            errors.title = 'Title is required';
        }

        if (!updates.type) {
            errors.type = 'Program type is required';
        }

        // Platform validation
        if (!updates.platform?.id) {
            errors.platform = 'Platform is required';
        }

        if (!updates.platformBinary?.id) {
            errors.platformBinary = 'Platform binary is required';
        }

        if (!updates.contentRating) {
            errors.contentRating = 'Content rating is required';
        }

        if (!updates.curationStatus) {
            errors.curationStatus = 'Curation status is required';
        }

        // Numeric validations
        if (updates.releaseYear) {
            const year = parseInt(updates.releaseYear);
            if (isNaN(year) || year < 1980 || year > new Date().getFullYear()) {
                errors.releaseYear = 'Invalid release year';
            }
        }

        // Other validations...
        return Object.keys(errors).length > 0 ? errors : null;
    };

    return {
        program,
        isLoading,
        error,
        updateProgram,
        validateUpdates
    };
};