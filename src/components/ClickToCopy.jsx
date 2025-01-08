import React, { useState } from 'react';

const ClickToCopy = ({ text, className }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <code
            className={`cursor-pointer ${className}`}
            onClick={handleCopy}
            title={text}
        >
            {copied ? 'Copied!' : `${text.substring(0, 12)}...`}
        </code>
    );
};

export default ClickToCopy;