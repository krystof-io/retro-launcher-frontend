import { useState } from 'react';
import { Star, Music, Monitor, Zap } from 'lucide-react';

const HARDCODED_USER_ID = "00000000-0000-0000-0000-000000000000"; // Replace with your user ID

const ProgramVoting = ({ program }) => {
    const [vote, setVote] = useState({
        musicScore: 0,
        graphicsScore: 0,
        vibesScore: 0,
        comment: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmitVote = async () => {
        try {
            setIsSubmitting(true);
            setError(null);

            const response = await fetch('/api/votes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Id': HARDCODED_USER_ID,
                    'X-Platform-Id': 'web'
                },
                body: JSON.stringify({
                    programId: program.id,
                    ...vote
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to submit vote');
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleScoreChange = (type, score) => {
        setVote(prev => ({
            ...prev,
            [type]: score
        }));
    };

    const VoteStars = ({ type, score, icon: Icon }) => (
        <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
                <Icon className="w-5 h-5" />
                <span className="font-medium capitalize">{type}</span>
            </div>
            <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                        key={rating}
                        onClick={() => handleScoreChange(`${type}Score`, rating)}
                        className={`p-1 rounded-full hover:bg-gray-100 transition-colors
                            ${vote[`${type}Score`] >= rating ? 'text-bg-danger' : 'text-gray-100'}`}
                    >
                        <Star className="w-8 h-8 fill-current" />
                    </button>
                ))}
            </div>
        </div>
    );

    const formatScore = (score) => score?.toFixed(1) || 'N/A';

    return (
        <div className="bg-white rounded-lg shadow p-1">
            <h5 className="font-semibold mb-4">Rate this Program</h5>

            {/* Current Scores */}
            {program.avgMusicScore || program.avgGraphicsScore || program.avgVibesScore ? (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium mb-2">Current Ratings</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <div className="flex items-center justify-center gap-1 text-blue-600">
                                <Music className="w-4 h-4" />
                                <span className="font-medium">{formatScore(program.avgMusicScore)}</span>
                            </div>
                            <div className="text-xs text-gray-500">Music</div>
                        </div>
                        <div>
                            <div className="flex items-center justify-center gap-1 text-green-600">
                                <Monitor className="w-4 h-4" />
                                <span className="font-medium">{formatScore(program.avgGraphicsScore)}</span>
                            </div>
                            <div className="text-xs text-gray-500">Graphics</div>
                        </div>
                        <div>
                            <div className="flex items-center justify-center gap-1 text-purple-600">
                                <Zap className="w-4 h-4" />
                                <span className="font-medium">{formatScore(program.avgVibesScore)}</span>
                            </div>
                            <div className="text-xs text-gray-500">Vibes</div>
                        </div>
                    </div>
                    <div className="mt-2 text-center">
                        <span className="text-xs text-gray-500">
                            {program.totalVotes} {program.totalVotes === 1 ? 'vote' : 'votes'} total
                        </span>
                    </div>
                </div>
            ) : null}

            {/* Voting Form */}
            <div className="space-y-4">
                <VoteStars type="music" score={vote.musicScore} icon={Music} />
                <VoteStars type="graphics" score={vote.graphicsScore} icon={Monitor} />
                <VoteStars type="vibes" score={vote.vibesScore} icon={Zap} />

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Comment (optional)
                    </label>
                    <textarea
                        value={vote.comment}
                        onChange={(e) => setVote(prev => ({ ...prev, comment: e.target.value }))}
                        className="w-100 p-2 border rounded-md"
                        rows={3}
                        placeholder="Share your thoughts..."
                    />
                </div>

                {error && (
                    <div className="text-red-600 text-sm p-2 bg-red-50 rounded">
                        {error}
                    </div>
                )}

                <button
                    onClick={handleSubmitVote}
                    disabled={isSubmitting || !(vote.musicScore && vote.graphicsScore && vote.vibesScore)}
                    className="w-100 bg-blue-600  py-2 px-4 rounded-md hover:bg-blue-700
                             disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                    {isSubmitting ? 'Submitting...' : 'Submit Vote'}
                </button>
            </div>
        </div>
    );
};

export default ProgramVoting;