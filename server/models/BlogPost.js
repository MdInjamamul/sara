const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please add a title'],
            trim: true,
            maxlength: [200, 'Title cannot exceed 200 characters']
        },
        slug: {
            type: String,
            unique: true,
            lowercase: true
        },
        content: {
            type: String,
            required: [true, 'Please add content']
        },
        excerpt: {
            type: String,
            trim: true,
            maxlength: [500, 'Excerpt cannot exceed 500 characters']
        },
        coverImage: {
            type: String,
            default: ''
        },
        category: {
            type: String,
            required: [true, 'Please add a category'],
            trim: true
        },
        tags: [{
            type: String,
            trim: true
        }],
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        status: {
            type: String,
            enum: ['draft', 'published'],
            default: 'draft'
        },
        isFeatured: {
            type: Boolean,
            default: false
        },
        readTime: {
            type: Number,
            default: 1
        }
    },
    {
        timestamps: true
    }
);

// Helper to strip HTML tags and decode common entities
const stripHtml = (html) => {
    let text = html.replace(/<[^>]+>/g, ' ');
    // Decode common HTML entities
    text = text
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&#x27;/g, "'")
        .replace(/&#x2F;/g, '/')
        .replace(/&[#a-zA-Z0-9]+;/g, ' ');
    // Collapse multiple spaces
    text = text.replace(/\s+/g, ' ').trim();
    return text;
};

// Auto-generate slug from title before saving
blogPostSchema.pre('save', function (next) {
    if (this.isModified('title')) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
        // Append a short timestamp to ensure uniqueness
        if (this.isNew) {
            this.slug += '-' + Date.now().toString(36);
        }
    }

    // Auto-calculate read time (average 200 words per minute)
    if (this.isModified('content')) {
        const plainText = stripHtml(this.content);
        const wordCount = plainText.split(/\s+/).filter(Boolean).length;
        this.readTime = Math.max(1, Math.ceil(wordCount / 200));
    }

    // Auto-generate excerpt from content if not provided
    if (this.isModified('content') && !this.excerpt) {
        const plainText = stripHtml(this.content);
        this.excerpt = plainText.substring(0, 160).trim() + '...';
    }

    next();
});

module.exports = mongoose.model('BlogPost', blogPostSchema);
