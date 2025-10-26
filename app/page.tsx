import ClientEffects from '../components/ClientEffects';

export default function HomePage() {
  return (
    <>
      <section className="hero" id="home">
        <h1>
          Beautiful Websites,<br />
          <span className="highlight">Your Colors</span>
        </h1>
        <p>
          Choose from professionally designed templates and make them your own with our intuitive color customization tools. 
          Build stunning websites in minutes, not hours.
        </p>
        <div className="hero-buttons">
          <a href="#" className="btn-primary">#</a>
          <a href="#" className="btn-secondary">#</a>
        </div>
      </section>

      <section className="preview-section" id="templates">
        <div className="preview-card">
          <div className="spline-bg">
            <iframe
              src="https://my.spline.design/websiteinteractiveflyingalien-ZaeUwJaTznpkZwIY6Lv9bRjq/"
              frameBorder="0"
              allow="autoplay; fullscreen"
              loading="lazy"
              title="Colorfy 3D Preview"
            />
          </div>

          <div className="mockup">
            <div className="mockup-icon" />
            <div className="mockup-bar" />
            <div className="mockup-bar" />
            <div className="mockup-bar" />
            <div className="mockup-button" />
          </div>

          <div className="customization-panel">
            <div className="badge">Live Preview</div>
            <h2>Customize Every Detail</h2>
            <p>
              Pick your perfect color palette and watch your website transform in real-time. Every shade, every gradient, perfectly tailored to your brand.
            </p>

            <div className="color-palette">
              <div className="color-swatch" style={{ background: '#06B6D4' }}><div className="color-code">#06B6D4</div></div>
              <div className="color-swatch" style={{ background: '#22D3EE' }}><div className="color-code">#22D3EE</div></div>
              <div className="color-swatch" style={{ background: '#8B5CF6' }}><div className="color-code">#8B5CF6</div></div>
              <div className="color-swatch" style={{ background: '#A78BFA' }}><div className="color-code">#A78BFA</div></div>
              <div className="color-swatch" style={{ background: 'linear-gradient(135deg, #06B6D4, #8B5CF6)' }}>
                <div className="color-code">Gradient</div>
              </div>
            </div>

            <div className="feature-tag">Unlimited color combinations</div>
          </div>
        </div>
      </section>

      <section className="features" id="features">
        <div className="section-header">
          <h2>Everything You Need</h2>
          <p>Powerful features to help you create the perfect website for your brand</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon cyan-blue">🎨</div>
            <h3>Color Customization</h3>
            <p>Instantly change your website&apos;s color scheme with our intuitive color picker. Preview changes in real-time before publishing.</p>
            <div className="feature-bars">
              <div className="feature-bar" style={{ background: '#06B6D4' }} />
              <div className="feature-bar" style={{ background: '#22D3EE' }} />
              <div className="feature-bar" style={{ background: '#67E8F9' }} />
            </div>
          </div>
          <div className="feature-card">
            <div className="feature-icon purple">📱</div>
            <h3>Premium Templates</h3>
            <p>Access hundreds of professionally designed templates for every industry. Each one fully responsive and ready to customize.</p>
            <div className="feature-bars">
              <div className="feature-bar" style={{ background: '#8B5CF6' }} />
              <div className="feature-bar" style={{ background: '#A78BFA' }} />
              <div className="feature-bar" style={{ background: '#C4B5FD' }} />
            </div>
          </div>
          <div className="feature-card">
            <div className="feature-icon gradient">⚡</div>
            <h3>Lightning Fast</h3>
            <p>Build and launch your website in minutes. No coding required. Just pick a template, customize colors, and publish.</p>
            <div className="feature-bars">
              <div className="feature-bar" style={{ background: '#06B6D4' }} />
              <div className="feature-bar" style={{ background: '#8B5CF6' }} />
              <div className="feature-bar" style={{ background: '#3B82F6' }} />
            </div>
          </div>
        </div>
      </section>

      <section className="how-it-works" id="about">
        <div className="section-header">
          <h2>How It Works</h2>
          <p>Three simple steps to your perfect website</p>
        </div>
        <div className="steps">
          <div className="step"><div className="step-number">1</div><h3>Choose a Template</h3><p>Browse our collection and select a template that matches your vision</p></div>
          <div className="step"><div className="step-number">2</div><h3>Customize Colors</h3><p>Use our color picker to match your brand identity perfectly</p></div>
          <div className="step"><div className="step-number">3</div><h3>Publish &amp; Share</h3><p>Launch your website with one click and share it with the world</p></div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Create Your Website?</h2>
          <p>Join thousands of users who have already built beautiful websites with Colorfy</p>
          <a href="/login" className="btn-white">Start Building for Free</a>
        </div>
      </section>

      <footer>
        <div className="footer-content">
          <div className="footer-brand">
            <h3>Colorfy</h3>
            <p>Create stunning websites with ease. Choose templates, customize colors, and launch in minutes.</p>
          </div>
          <div className="footer-column">
            <h4>Product</h4>
            <ul className="footer-links">
              <li><a href="#">Templates</a></li>
              <li><a href="#">Features</a></li>
              <li><a href="#">Steps</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Company</h4>
            <ul className="footer-links">
              <li><a href="#">About</a></li>
              <li><a href="#">Contact</a></li>
              <li><a href="#">Support</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom"><p>© 2025 Colorfy. All rights reserved.</p></div>
      </footer>

      <ClientEffects />
    </>
  );
}
