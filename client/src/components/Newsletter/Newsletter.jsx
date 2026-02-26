import { useState } from 'react';
import './Newsletter.css';

const Newsletter = () => {
    const [email, setEmail] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle newsletter subscription
        alert(`Thank you for subscribing with ${email}!`);
        setEmail('');
    };

    return (
        <section className="newsletter">
            <div className="container">
                <div className="newsletter-content">
                    <h2>Join Our Newsletter</h2>
                    <p>
                        Subscribe to receive updates on new products, special offers, and wellness tips
                        delivered straight to your inbox.
                    </p>
                    <form className="newsletter-form" onSubmit={handleSubmit}>
                        <input
                            type="email"
                            placeholder="Enter your email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <button type="submit">Subscribe</button>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default Newsletter;
