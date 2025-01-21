import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { Save, ArrowLeft } from 'lucide-react';
import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import { searchAuthors, fetchPlatforms, fetchContentRatings } from '../services/api';


const ProgramCreate = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [platforms, setPlatforms] = useState([]);
    const [authorOptions, setAuthorOptions] = useState([]);
    const [contentRatings, setContentRatings] = useState([]);
    const [isLoadingAuthors, setIsLoadingAuthors] = useState(false);

    const [program, setProgram] = useState({
        title: '',
        description: '',
        type: 'DEMO',
        platform: null,
        platformBinary: null,
        releaseYear: new Date().getFullYear(),
        authors: [],
        contentRating: 'UNRATED',
        curationStatus: 'UNCURATED',
        curatorNotes: '',
        diskImages: [],
        launchArguments: []
    });

    // Load initial data
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [platformsData, ratingsData] = await Promise.all([
                    fetchPlatforms(),
                    fetchContentRatings()
                ]);
                setPlatforms(platformsData);
                setContentRatings(ratingsData);
            } catch (err) {
                setError('Failed to load initial data');
                console.error(err);
            }
        };

        loadInitialData();
    }, []);

    const handleAuthorSearch = async (query) => {
        setIsLoadingAuthors(true);
        try {
            const authors = await searchAuthors(query);
            setAuthorOptions(authors);
        } catch (error) {
            console.error('Error searching authors:', error);
            setAuthorOptions([]);
        } finally {
            setIsLoadingAuthors(false);
        }
    };

    const handlePlatformChange = (e) => {
        const platform = platforms.find(p => p.id === Number(e.target.value));
        setProgram(prev => ({
            ...prev,
            platform,
            platformBinary: null
        }));
    };

    const handleBinaryChange = (e) => {
        const binary = program.platform?.binaries?.find(b => b.id === Number(e.target.value));
        setProgram(prev => ({
            ...prev,
            platformBinary: binary
        }));
    };

    const handleSave = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Validate required fields
            if (!program.title) throw new Error('Title is required');
            if (!program.platform) throw new Error('Platform is required');
            if (!program.platformBinary) throw new Error('Platform binary is required');

            // Make API call to create program
            const response = await fetch('/api/program', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(program),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create program');
            }

            const savedProgram = await response.json();
            navigate(`/program/${savedProgram.id}`);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            <Button
                variant="link"
                onClick={() => navigate('/programs')}
                className="mb-4 d-flex align-items-center gap-2"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Programs
            </Button>

            {error && (
                <Alert variant="danger" className="mb-4">
                    {error}
                </Alert>
            )}

            <Card className="mb-4">
                <Card.Header>
                    <h2 className="mb-0">New Program</h2>
                </Card.Header>
                <Card.Body>
                    <Form>
                        {/* Basic Information */}
                        <Form.Group className="mb-3">
                            <Form.Label>Title *</Form.Label>
                            <Form.Control
                                type="text"
                                value={program.title}
                                onChange={(e) => setProgram(prev => ({
                                    ...prev,
                                    title: e.target.value
                                }))}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={program.description}
                                onChange={(e) => setProgram(prev => ({
                                    ...prev,
                                    description: e.target.value
                                }))}
                            />
                        </Form.Group>

                        <div className="row">
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Type *</Form.Label>
                                    <Form.Select
                                        value={program.type}
                                        onChange={(e) => setProgram(prev => ({
                                            ...prev,
                                            type: e.target.value
                                        }))}
                                        required
                                    >
                                        <option value="DEMO">Demo</option>
                                        <option value="GAME">Game</option>
                                        <option value="MUSIC">Music</option>
                                    </Form.Select>
                                </Form.Group>
                            </div>

                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Release Year</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={program.releaseYear}
                                        onChange={(e) => setProgram(prev => ({
                                            ...prev,
                                            releaseYear: e.target.value
                                        }))}
                                        min="1980"
                                        max={new Date().getFullYear()}
                                    />
                                </Form.Group>
                            </div>
                        </div>

                        {/* Platform Selection */}
                        <div className="row">
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Platform *</Form.Label>
                                    <Form.Select
                                        value={program.platform?.id || ''}
                                        onChange={handlePlatformChange}
                                        required
                                    >
                                        <option value="">Select Platform</option>
                                        {platforms.map(platform => (
                                            <option key={platform.id} value={platform.id}>
                                                {platform.name}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </div>

                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Platform Binary *</Form.Label>
                                    <Form.Select
                                        value={program.platformBinary?.id || ''}
                                        onChange={handleBinaryChange}
                                        disabled={!program.platform}
                                        required
                                    >
                                        <option value="">Select Binary</option>
                                        {program.platform?.binaries?.map(binary => (
                                            <option key={binary.id} value={binary.id}>
                                                {binary.name} ({binary.variant})
                                                {binary.isDefault ? ' - Default' : ''}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </div>
                        </div>

                        {/* Authors */}
                        <Form.Group className="mb-3">
                            <Form.Label>Authors</Form.Label>
                            <AsyncTypeahead
                                id="author-search"
                                isLoading={isLoadingAuthors}
                                multiple
                                minLength={2}
                                onSearch={handleAuthorSearch}
                                onChange={(selected) => setProgram(prev => ({
                                    ...prev,
                                    authors: selected
                                }))}
                                options={authorOptions}
                                selected={program.authors}
                                labelKey="name"
                                renderMenuItemChildren={(author) => (
                                    <div>
                                        <span>{author.name}</span>
                                        {author.description && (
                                            <small className="d-block text-muted">
                                                {author.description}
                                            </small>
                                        )}
                                    </div>
                                )}
                            />
                        </Form.Group>

                        {/* Content Rating */}
                        <Form.Group className="mb-3">
                            <Form.Label>Content Rating</Form.Label>
                            <Form.Select
                                value={program.contentRating}
                                onChange={(e) => setProgram(prev => ({
                                    ...prev,
                                    contentRating: e.target.value
                                }))}
                            >
                                {contentRatings.map(rating => (
                                    <option key={rating} value={rating}>
                                        {rating}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        {/* Curator Notes */}
                        <Form.Group className="mb-3">
                            <Form.Label>Curator Notes</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={program.curatorNotes}
                                onChange={(e) => setProgram(prev => ({
                                    ...prev,
                                    curatorNotes: e.target.value
                                }))}
                                placeholder="Add any notes about program compatibility, setup requirements, etc."
                            />
                        </Form.Group>

                        <div className="d-flex gap-2">
                            <Button
                                variant="primary"
                                onClick={handleSave}
                                disabled={isLoading}
                            >
                                <Save className="w-4 h-4 me-2" />
                                {isLoading ? 'Creating...' : 'Create Program'}
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => navigate('/programs')}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>

            {/* Disk Images Section - Will be enabled after initial save */}
            <Card className="mb-4">
                <Card.Header>
                    <h3 className="mb-0">Disk Images</h3>
                </Card.Header>
                <Card.Body>
                    <Alert variant="info">
                        Save the program first to add disk images.
                    </Alert>
                </Card.Body>
            </Card>
        </div>
    );
};

export default ProgramCreate;