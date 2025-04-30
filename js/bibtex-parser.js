document.addEventListener('DOMContentLoaded', function() {
    console.log("DOMContentLoaded event fired, starting BibTeX parser");
    
    // Fetch the BibTeX file
    console.log("Fetching BibTeX file from content/documents/publications.bib");
    const isPublicationsPage = window.location.pathname.includes('/pages/');
    const bibPath = isPublicationsPage ? '../content/documents/publications.bib' : 'content/documents/publications.bib';
    
    fetch(bibPath)
        .then(response => {
            console.log("BibTeX file fetch response received:", response.ok ? "OK" : "Failed");
            return response.text();
        })
        .then(data => {
            console.log("BibTeX data loaded, length:", data.length);
            console.log("Sample of BibTeX data:", data.substring(0, 200) + "...");
            
            const publications = parseBibTeX(data);
            console.log(`Parsed ${publications.length} publications from BibTeX`);
            
            // Check if MathJax is already loaded
            if (window.MathJax && window.MathJax.typeset) {
                console.log("MathJax already loaded, displaying publications immediately");
                displayPublications(publications);
            } else {
                console.log("MathJax not yet loaded, setting up load callback");
                // Wait for MathJax to be fully loaded before displaying
                window.MathJax = window.MathJax || {};
                window.MathJax.startup = window.MathJax.startup || {};
                
                // Store the original pageReady function if it exists
                const originalPageReady = window.MathJax.startup.pageReady;
                console.log("Original MathJax pageReady function:", originalPageReady ? "exists" : "doesn't exist");
                
                // Override pageReady to run after MathJax initialization
                window.MathJax.startup.pageReady = function() {
                    console.log("MathJax pageReady triggered");
                    // First run the original pageReady if it exists
                    const promise = originalPageReady ? originalPageReady.apply(this, arguments) : Promise.resolve();
                    
                    // Then display our publications and typeset when ready
                    return promise.then(() => {
                        console.log("MathJax initialization complete, now displaying publications");
                        displayPublications(publications);
                        console.log("About to trigger MathJax typeset");
                        window.MathJax.typeset();
                        console.log("MathJax typeset called");
                    });
                };
            }
        })
        .catch(error => console.error('Error loading BibTeX file:', error));
});

function parseBibTeX(bibtex) {
    console.log("Starting to parse BibTeX data");
    const entries = [];
    
    // First, extract each entry block
    const entryRegex = /@([^{]+)\{([^,]+),([\s\S]+?)(?=\n\s*@|\s*$)/g;
    
    let entryMatch;
    while (entryMatch = entryRegex.exec(bibtex)) {
        const type = entryMatch[1].trim().toLowerCase();
        const citationKey = entryMatch[2].trim();
        const fieldsText = entryMatch[3];
        
        console.log(`Found entry: ${type} [${citationKey}]`);
        
        const entry = {
            type: type,
            key: citationKey,
            fields: {},
            selected: false
        };
        
        // Extract fields with better handling of nested braces
        // This regex pattern matches field = {value} including nested braces
        const fieldPattern = /(\w+)\s*=\s*\{((?:[^{}]|(?:\{(?:[^{}]|(?:\{[^{}]*\}))*\}))*)\}/g;
        
        let fieldMatch;
        while (fieldMatch = fieldPattern.exec(fieldsText)) {
            const fieldName = fieldMatch[1].trim().toLowerCase();
            const fieldValue = fieldMatch[2].trim();
            
            console.log(`  Field: ${fieldName} = ${fieldValue.substring(0, 30)}${fieldValue.length > 30 ? '...' : ''}`);
            entry.fields[fieldName] = fieldValue;
        }
        
        // Check for selected flag (special handling for boolean value)
        if (fieldsText.match(/selected\s*=\s*\{true\}/i) || fieldsText.match(/selected\s*=\s*true/i)) {
            entry.selected = true;
            console.log(`  Entry marked as selected: ${citationKey}`);
        }
        
        // Check if we parsed essential fields
        if (!entry.fields.title) {
            console.warn(`Warning: No title found for entry ${citationKey}`);
            
            // Fallback method for title extraction
            const titleMatch = fieldsText.match(/title\s*=\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}/);
            if (titleMatch) {
                entry.fields.title = titleMatch[1].trim();
                console.log(`  Extracted title using fallback: ${entry.fields.title.substring(0, 30)}...`);
            }
        }
        
        entries.push(entry);
    }
    
    console.log(`Parsed ${entries.length} entries from BibTeX`);
    
    return entries.sort((a, b) => {
        const yearA = parseInt(a.fields.year || '0');
        const yearB = parseInt(b.fields.year || '0');
        return yearB - yearA; // Sort by year descending (newest first)
    });
}

function formatAuthors(authors, maxDisplay = 3) {
    if (!authors) return '';
    
    // Replace 'and' with commas for splitting
    const authorList = authors.split(/ and /);
    
    // If we have more than maxDisplay authors, truncate with et al.
    if (authorList.length > maxDisplay) {
        return authorList.slice(0, maxDisplay).join(', ') + ', <em>et al.</em>';
    }
    
    return authorList.join(', ');
}

// Process LaTeX in text and make it MathJax-compatible
function processLatex(text) {
    console.log("Processing LaTeX in text:", text ? text.substring(0, 50) + "..." : "empty");
    
    if (!text) return '';
    
    // Don't modify text that's already been processed
    if (text.includes('class="math')) {
        console.log("Text already contains math class, returning as is");
        return text;
    }
    
    // Replace empty braces that might interfere with parsing
    text = text.replace(/\{\}/g, '');
    console.log("After removing empty braces:", text.substring(0, 50) + "...");
    
    // First, safely extract and store LaTeX expressions to prevent regex conflicts
    const mathExpressions = [];
    let processedText = text;
    
    // Handle display math: $$...$$
    let displayMathCount = 0;
    processedText = processedText.replace(/\$\$(.*?)\$\$/g, function(match, p1) {
        displayMathCount++;
        const id = mathExpressions.length;
        console.log(`Found display math #${displayMathCount}:`, match);
        mathExpressions.push(`<span class="math-display">$$${p1}$$</span>`);
        return `__MATH_PLACEHOLDER_${id}__`;
    });
    console.log(`Replaced ${displayMathCount} display math expressions`);
    
    // Handle inline math: $...$
    let inlineMathCount = 0;
    processedText = processedText.replace(/\$(.*?)\$/g, function(match, p1) {
        inlineMathCount++;
        const id = mathExpressions.length;
        console.log(`Found inline math #${inlineMathCount}:`, match);
        mathExpressions.push(`<span class="math-inline">$${p1}$</span>`);
        return `__MATH_PLACEHOLDER_${id}__`;
    });
    console.log(`Replaced ${inlineMathCount} inline math expressions`);
    
    // Replace placeholders with actual math expressions
    for (let i = 0; i < mathExpressions.length; i++) {
        processedText = processedText.replace(
            `__MATH_PLACEHOLDER_${i}__`, 
            mathExpressions[i]
        );
    }
    
    console.log("Final processed text:", processedText.substring(0, 100) + "...");
    return processedText;
}

function displayPublications(publications) {
    console.log("displayPublications called with", publications.length, "publications");
    
    // Separate publications by type
    const articles = publications.filter(pub => 
        pub.type === 'article' || 
        (pub.fields.type && pub.fields.type.toLowerCase() === 'article'));
    
    const presentations = publications.filter(pub => 
        pub.type === 'presentation' || 
        (pub.fields.type && pub.fields.type.toLowerCase() === 'presentation'));
    
    console.log(`Separated into ${articles.length} articles and ${presentations.length} presentations`);
    
    // Check if we're on the main page - filter for selected publications only
    const isMainPage = !window.location.pathname.includes('/publications.html');
    
    // Handle articles
    const articlesContainer = document.getElementById('articles-list');
    if (articlesContainer) {
        articlesContainer.innerHTML = ''; // Clear any existing content
        
        let displayArticles = articles;
        if (isMainPage) {
            displayArticles = articles.filter(pub => pub.selected);
            console.log(`Filtered to ${displayArticles.length} selected articles for main page`);
        }
        
        displayPublicationList(displayArticles, articlesContainer);
    } else if (articles.length > 0) {
        console.error("Articles list container not found!");
    }
    
    // Handle presentations
    const presentationsContainer = document.getElementById('presentations-list');
    if (presentationsContainer) {
        presentationsContainer.innerHTML = ''; // Clear any existing content
        
        let displayPresentations = presentations;
        if (isMainPage) {
            displayPresentations = presentations.filter(pub => pub.selected);
            console.log(`Filtered to ${displayPresentations.length} selected presentations for main page`);
        }
        
        displayPublicationList(displayPresentations, presentationsContainer);
    } else if (presentations.length > 0) {
        console.error("Presentations list container not found!");
    }
    
    // For backward compatibility with the main page
    const mainContainer = document.getElementById('publications-list');
    if (mainContainer) {
        mainContainer.innerHTML = ''; // Clear any existing content
        
        let displayPublications = publications;
        if (isMainPage) {
            displayPublications = publications.filter(pub => pub.selected);
            console.log(`Filtered to ${displayPublications.length} selected publications for main page`);
        }
        
        displayPublicationList(displayPublications, mainContainer);
    }
    
    // Tell MathJax to typeset the new content
    if (window.MathJax) {
        console.log("MathJax object found, scheduling typeset");
        setTimeout(() => {
            console.log("Timeout elapsed, now calling MathJax.typeset()");
            try {
                window.MathJax.typeset();
                console.log("MathJax.typeset() called successfully");
            } catch (error) {
                console.error("Error calling MathJax.typeset():", error);
            }
        }, 200);
    } else {
        console.warn("MathJax not available for typesetting!");
    }
}

// Helper function to display a list of publications in a container
function displayPublicationList(publications, container) {
    let publicationCounter = 0;
    publications.forEach(pub => {
        publicationCounter++;
        console.log(`Processing publication #${publicationCounter}:`, pub.key);
        
        // Format authors with potential truncation for long lists
        const authors = formatAuthors(pub.fields.author, 5);
        console.log("Formatted authors:", authors);
        
        // Create list item for publication
        const li = document.createElement('li');
        li.className = 'publication-item';
        
        // Determine the link URL - prefer direct URL if available
        let linkUrl = '';
        let titleElement = '';
        
        if (pub.fields.url) {
            linkUrl = pub.fields.url;
            console.log("Using URL from url field:", linkUrl);
        } else if (pub.fields.doi) {
            linkUrl = `https://doi.org/${pub.fields.doi}`;
            console.log("Using URL from DOI:", linkUrl);
        } else if (pub.fields.eprint) {
            // Handle arXiv links - now we just need the eprint field
            linkUrl = `https://arxiv.org/abs/${pub.fields.eprint}`;
            console.log("Using URL from eprint (arXiv):", linkUrl);
        } else {
            console.log("No URL found for this publication");
        }
        
        // Process the title with LaTeX support
        console.log("Original title:", pub.fields.title);
        const processedTitle = processLatex(pub.fields.title);
        console.log("Processed title:", processedTitle);
        
        // Format the title with link if available
        if (linkUrl) {
            titleElement = `<a href="${linkUrl}" target="_blank">${processedTitle}</a>`;
        } else {
            titleElement = processedTitle;
        }
        
        // Journal/venue information
        let venueInfo = '';
        
        // Handle different publication types
        if (pub.fields.journal) {
            // Regular journal article
            venueInfo = `<em>${processLatex(pub.fields.journal)}</em>`;
            if (pub.fields.volume) {
                venueInfo += ` <strong>${pub.fields.volume}</strong>`;
                if (pub.fields.number) {
                    venueInfo += `(${pub.fields.number})`;
                }
            }
            if (pub.fields.pages) {
                venueInfo += `, ${pub.fields.pages}`;
            }
        } else if (pub.fields.booktitle) {
            // Conference paper
            venueInfo = `In: <em>${processLatex(pub.fields.booktitle)}</em>`;
            if (pub.fields.pages) {
                venueInfo += `, pp. ${pub.fields.pages}`;
            }
        } else if (pub.fields.eprint) {
            // arXiv paper
            venueInfo = `<em>arXiv</em>: ${pub.fields.eprint}`;
            if (pub.fields.primaryclass) {
                venueInfo += ` [${pub.fields.primaryclass}]`;
            }
        } else if (pub.type === 'misc' || pub.type === 'unpublished') {
            // Other publications
            venueInfo = pub.fields.howpublished || pub.fields.note || 'Preprint';
        }
        
        // Add year if available
        if (pub.fields.year) {
            venueInfo += ` (${pub.fields.year})`;
        }
        
        console.log("Venue info:", venueInfo);
        
        // Create HTML structure
        li.innerHTML = `
            <div class="pub-title">${titleElement}</div>
            <div class="pub-authors">${authors}</div>
            <div class="pub-venue">${venueInfo}.</div>
        `;
        
        container.appendChild(li);
        console.log(`Publication #${publicationCounter} added to DOM`);
    });
}