import "./Home.css";
import image from "../../assets/images/home.png";
import { useNavigate } from "react-router-dom";



export default function Home() {
    const navigate = useNavigate();
   

  return (
    
    <div className="home">
      <div className="bg-orb orb-1"></div>
      <div className="bg-orb orb-2"></div>
      <div className="bg-orb orb-3"></div>

      <nav className="navbar">
        <div className="logo-wrap">
          <div className="logo-icon">M</div>
          <div className="logo-text">MicroConnect</div>
        </div>

        <div className="nav-links">
          <a href="#about">About Us</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#faqs">FAQs</a>
        </div>

        <div className="nav-actions">
          <button className="ghost-btn" onClick={() => navigate("/login")}>
            Log in
          </button>
        
          <button  className="primary-btn" onClick={() => navigate("/create-account")}>Sign Up</button>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-left">
          <div className="hero-badge">✦ The future of influencer marketing</div>

          <h1 className="hero-title">
            Micro <span> Connect</span>
    
          </h1>

          <p>
            <strong>Connecting emerging brands with micro-influencers </strong> 
          </p>

          <p>Unlock authentic partnerships that drive real engagement. Join thousands of brands and influencers creating meaningful connections.</p>

          <div className="hero-buttons">
          
            <button className="primary-btn" onClick={() => navigate("/create-account")}>
                ⚡ Sign Up Free
            </button>
    
           <button className="secondary-btn large-btn" onClick={() => navigate("/login")}>
            Log in
          </button>
           </div>

          <div className="hero-metrics">
            <div className="metric-card">
              <h4>2.4K+</h4>
              <span>Campaign Interactions</span>
            </div>

            <div className="metric-card">
              <h4>12K+</h4>
              <span>Creator Reach</span>
            </div>

            <div className="metric-card">
              <h4>156</h4>
              <span>Active Matches</span>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-visual-card">
            <img
              src={image}
              alt="Influencer creating content"
            />

            <div className="floating stat-one">💬 156</div>
            <div className="floating stat-two">❤️ 2.4K</div>
            <div className="floating stat-three">👥 12K</div>

            <div className="visual-overlay-card">
              <p className="overlay-title">Campaign Match Score</p>
              <h3>92%</h3>
              <span>Strong audience alignment</span>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="section-card">
        <div className="section-head">
          <span className="section-kicker">ABOUT US</span>
          <h2>Built for authentic collaboration</h2>
        </div>

        <p className="section-text">
          MicroConnect is a platform designed to make collaboration between
          emerging brands and micro-influencers simpler, smarter, and more
          genuine. Instead of focusing only on large numbers, we help users
          build partnerships based on compatibility, niche alignment, and
          meaningful engagement.
        </p>
      </section>

      <section id="how-it-works" className="section-card">
        <div className="section-head">
          <span className="section-kicker">HOW IT WORKS</span>
          <h2>A simple flow with real impact</h2>
        </div>

        <div className="cards-grid">
          <div className="info-card">
            <div className="card-number">01</div>
            <h3>Create Your Profile</h3>
            <p>
              Sign up as a brand or influencer and set up your profile with the
              details that define your goals, audience, and identity.
            </p>
          </div>

          <div className="info-card">
            <div className="card-number">02</div>
            <h3>Discover Matches</h3>
            <p>
              Explore relevant profiles, opportunities, and partnerships based
              on niche, fit, engagement style, and campaign needs.
            </p>
          </div>

          <div className="info-card">
            <div className="card-number">03</div>
            <h3>Collaborate Confidently</h3>
            <p>
              Build stronger brand-creator partnerships through a cleaner,
              easier, and more inspiring collaboration experience.
            </p>
          </div>
        </div>
      </section>

      <section id="faqs" className="section-card">
        <div className="section-head">
          <span className="section-kicker">FAQS</span>
          <h2>Questions people usually ask</h2>
        </div>

        <div className="faq-grid">
          <div className="faq-card">
            <h3>Who can use MicroConnect?</h3>
            <p>
              The platform is built for brands, influencers, and administrators,
              each with their own tailored experience and interface.
            </p>
          </div>

          <div className="faq-card">
            <h3>Why micro-influencers?</h3>
            <p>
              Micro-influencers often have stronger audience trust and better
              engagement, which can lead to more authentic results.
            </p>
          </div>

          <div className="faq-card">
            <h3>Is it suitable for small brands?</h3>
            <p>
              Yes. MicroConnect is especially useful for startups and emerging
              brands that want affordable and targeted collaborations.
            </p>
          </div>
        </div>
      </section>
    </div>
   
  );
}