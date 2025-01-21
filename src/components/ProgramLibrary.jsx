import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Badge, Container, Row, Col, Table, Pagination  } from 'react-bootstrap';
import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import { Link } from 'react-router-dom';
import { LucideCheckCircle2, LucideHelpCircle, LucideTriangleAlert, Search, X  } from 'lucide-react';
import WindowedPagination from './WindowedPagination';
import {
    fetchPlatforms,
    searchAuthors,
    fetchContentRatings,
    fetchCurationStatuses,
    fetchPrograms
} from '../services/api';
import PropTypes from 'prop-types';

const ProgramLibrary = () => {
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const itemsPerPage = 10;

    // Author typeahead options
    const [authorOptions, setAuthorOptions] = useState([]);
    const [platforms, setPlatforms] = useState([]);
    const [contentRatings, setContentRatings] = useState([]);
    const [curationStatuses, setCurationStatuses] = useState([]);
    const [isLoadingAuthors, setIsLoadingAuthors] = useState(false);
    const [platformBinaries, setPlatformBinaries] = useState([]);

    // Search criteria state
    const [filters, setFilters] = useState({
        titleSearch: '',
        curationStatus: '',
        platform: '',
        platformBinaryId: '',
        contentRating: '',
        author: '',
        yearFrom: '',
        yearTo: '',
        sourceId: '',
    });

    // Results state
    const [searchResults, setSearchResults] = useState([]);

    // Active filters count
    const activeFilterCount = Object.values(filters).filter(Boolean).length;

    // Update a single filter
    const updateFilter = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
        setCurrentPage(1); // Reset to first page on filter change
    };

    // Clear all filters
    const clearFilters = () => {
        setFilters({
            titleSearch: '',
            curationStatus: '',
            platform: '',
            platformBinaryId: '',
            contentRating: '',
            author: '',
            yearFrom: '',
            yearTo: '',
            sourceId: '',
        });
        setCurrentPage(1); // Reset to first page on filter change
    };

    // Load initial data
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [platformsData, ratingsData, statusesData] = await Promise.all([
                    fetchPlatforms(),
                    fetchContentRatings(),
                    fetchCurationStatuses()
                ]);
                setPlatforms(platformsData);
                 setContentRatings(ratingsData);
                 setCurationStatuses(statusesData);
                const allBinaries = platformsData.flatMap(platform =>
                    platform.binaries.map(binary => ({
                        ...binary,
                        platformName: platform.name
                    }))
                );
                setPlatformBinaries(allBinaries);
            } catch (error) {
                console.error('Error loading initial data:', error);
                // You might want to show an error message to the user here
            }
        };

        loadInitialData();
    }, []);

    // Handle author search with debouncing
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

    const searchPrograms = async (page) => {
        setIsLoading(true);
        try {

            const result = await fetchPrograms({
                titleSearch: filters.titleSearch,
                platformId: filters.platform,
                platformBinaryId: filters.platformBinaryId,
                curationStatus: filters.curationStatus,
                contentRating: filters.contentRating,
                authorId: filters.author,
                yearFrom: filters.yearFrom || undefined,
                yearTo: filters.yearTo || undefined,
                sourceId: filters.sourceId,
                page: page - 1, // API uses 0-based pagination
                size: itemsPerPage
            });

            setSearchResults(result.content);
            setTotalPages(result.totalPages);
        } catch (error) {
            console.error('Error searching programs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Trigger search when page changes
    useEffect(() => {
        searchPrograms(currentPage);
    }, [currentPage, filters]);


    const StatusBadge = ({ status }) => {
        const getStatusProps = (status) => {
            switch (status) {
                case 'WORKING':
                    return { icon: LucideCheckCircle2, bg: 'success', text: 'Working' };
                case 'BROKEN':
                    return { icon: LucideTriangleAlert, bg: 'danger', text: 'Broken' };
                default:
                    return { icon: LucideHelpCircle, bg: 'warning', text: 'Uncurated' };
            }
        };

        const { icon: Icon, bg, text } = getStatusProps(status);

        return (
            <Badge bg={bg} className="d-flex align-items-center gap-1">
                <Icon size={14} />
                <span>{text}</span>
            </Badge>
        );
    };

    StatusBadge.propTypes = {
        status: PropTypes.string.isRequired,
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    // Render pagination controls
    const renderPagination = () => {

        return (
            <WindowedPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                maxVisible={10}
            />
        );
    };


    return (
        <Container fluid className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Program Library</h1>
                <div className="d-flex align-items-center gap-2">
                    {activeFilterCount > 0 && (
                        <Badge bg="secondary">
                            {activeFilterCount} active filter{activeFilterCount !== 1 ? 's' : ''}
                        </Badge>
                    )}
                    <Button
                        variant="outline-secondary"
                        onClick={clearFilters}
                        disabled={activeFilterCount === 0}
                    >
                        <X size={16} className="me-2" />
                        Clear Filters
                    </Button>
                </div>
            </div>

            {/* Search and Filters */}
            <Card className="mb-4">
                <Card.Body>
                    <Row className="g-3">
                        {/* Title Search */}
                        <Col md={6} lg={4}>
                            <Form.Group>
                                <Form.Label>Title Search</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Search by title..."
                                    value={filters.titleSearch}
                                    onChange={(e) => updateFilter('titleSearch', e.target.value)}
                                />
                            </Form.Group>
                        </Col>

                        {/* Curation Status */}
                        <Col md={6} lg={4}>
                            <Form.Group>
                                <Form.Label>Curation Status</Form.Label>
                                <Form.Select
                                    value={filters.curationStatus}
                                    onChange={(e) => updateFilter('curationStatus', e.target.value)}
                                >
                                    <option value="">All Statuses</option>
                                    {curationStatuses.map(status => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        {/* Platform */}
                        <Col md={6} lg={4}>
                            <Form.Group>
                                <Form.Label>Platform</Form.Label>
                                <Form.Select
                                    value={filters.platform}
                                    onChange={(e) => updateFilter('platform', e.target.value)}
                                >
                                    <option value="">All Platforms</option>
                                    {platforms.map(platform => (
                                        <option key={platform.id} value={platform.id}>{platform.name}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        {/* Platform Binary */}
                        <Col md={6} lg={4}>
                            <Form.Group>
                                <Form.Label>Platform Binary</Form.Label>
                                <Form.Select
                                    value={filters.platformBinaryId}
                                    onChange={(e) => updateFilter('platformBinaryId', e.target.value)}
                                >
                                    <option value="">All Binaries</option>
                                    {platformBinaries.map(binary => (
                                        <option key={binary.id} value={binary.id}>
                                            {binary.platformName} - {binary.name} ({binary.variant})
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        {/* Content Rating */}
                        <Col md={6} lg={4}>
                            <Form.Group>
                                <Form.Label>Content Rating</Form.Label>
                                <Form.Select
                                    value={filters.contentRating}
                                    onChange={(e) => updateFilter('contentRating', e.target.value)}
                                >
                                    <option value="">All Ratings</option>
                                    {contentRatings.map(rating => (
                                        <option key={rating} value={rating}>{rating}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        {/* Author */}
                        <Col md={6} lg={4}>
                            <Form.Group>
                                <Form.Label>Author</Form.Label>
                                <AsyncTypeahead
                                    id="author-search"
                                    isLoading={isLoadingAuthors}
                                    minLength={2}
                                    onSearch={handleAuthorSearch}
                                    onChange={(selected) => {
                                        updateFilter('author', selected[0]?.id || '');
                                    }}
                                    labelKey={(author) => author.name}
                                    options={authorOptions}
                                    placeholder="Type to search authors..."
                                    selected={filters.author ? authorOptions.filter(a => a.id === filters.author) : []}
                                    renderMenuItemChildren={(author) => (
                                        <div>
                                            <span>{author.name}</span>
                                            {author.description && (
                                                <small className="d-block text-muted">{author.description}</small>
                                            )}
                                        </div>
                                    )}
                                />
                            </Form.Group>
                        </Col>

                        {/* Year Range */}
                        <Col md={6} lg={4}>
                            <Form.Group>
                                <Form.Label>Release Year</Form.Label>
                                <div className="d-flex gap-2">
                                    <Form.Control
                                        type="number"
                                        placeholder="From"
                                        value={filters.yearFrom}
                                        onChange={(e) => updateFilter('yearFrom', e.target.value)}
                                        min="1980"
                                        max="2024"
                                    />
                                    <Form.Control
                                        type="number"
                                        placeholder="To"
                                        value={filters.yearTo}
                                        onChange={(e) => updateFilter('yearTo', e.target.value)}
                                        min="1980"
                                        max="2024"
                                    />
                                </div>
                            </Form.Group>
                        </Col>
                        {/* Source ID */}
                        <Col md={6} lg={4}>
                            <Form.Group>
                                <Form.Label>Source ID</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Search by source ID..."
                                    value={filters.sourceId}
                                    onChange={(e) => updateFilter('sourceId', e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Results Table */}
            <Card>
                <Card.Body>
                    <Table responsive hover>
                        <thead>
                        <tr>
                            <th>Title</th>
                            <th>Platform</th>
                            <th>Binary</th>
                            <th>Type</th>
                            <th>Year</th>
                            <th>Author</th>
                            <th>Status</th>
                            <th>Rating</th>
                            <th>Runs</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan="8" className="text-center py-4">
                                    Loading...
                                </td>
                            </tr>
                        ) : searchResults.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="text-center py-4">
                                    No results found
                                </td>
                            </tr>
                        ) : (
                            searchResults.map(program => (
                                <tr key={program.id}>
                                    <td>{program.title}</td>
                                    <td>{program.platform.name}</td>
                                    <td>
                                        {program.platformBinary ? (
                                            <div>
                                                <div className="font-weight-bold">
                                                    {program.platformBinary.name}
                                                </div>
                                                <small className="text-muted">
                                                    {program.platformBinary.variant}
                                                </small>
                                            </div>
                                        ) : (
                                            <span className="text-muted">Default</span>
                                        )}
                                    </td>
                                    <td>{program.type}</td>
                                    <td>{program.releaseYear}</td>
                                    <td>
                                        {program.authors?.map((author, index) => (
                                            <React.Fragment key={author.id}>
                                                {author.name}
                                                {index < program.authors.length - 1 ? ', ' : ''}
                                            </React.Fragment>
                                        ))}
                                    </td>
                                    <td><StatusBadge status={program.curationStatus}/></td>
                                    <td>
                                        <Badge bg={program.contentRating === 'NSFW' ? 'danger' : 'info'}>
                                            {program.contentRating}
                                        </Badge>
                                    </td>
                                    <td>{program.runCount}</td>
                                    <td>
                                        <Button
                                            variant="link"
                                            as={Link}
                                            to={`/program/${program.id}`}
                                            className="p-0 d-flex align-items-center gap-1"
                                        >
                                            Details
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </Table>

                    {/* Pagination */}
                    {(!isLoading && searchResults.length > 0) && renderPagination()}
                </Card.Body>
            </Card>
        </Container>
    );
};

export default ProgramLibrary;