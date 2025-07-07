import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Welcome.css";

const learningPaths = [
  {
    imgSrc: "/basics.jpg",
    alt: "Cybersecurity Basics",
    title: "Beginner Level",
    description: "New to tech and security? Start here to learn essential digital safety skills and fundamentals of cybersecurity.",
    modules: [
      "🔒 Password Security",
      "📱 Mobile Device Security",
      "🌐 Secure Internet Usage",
      "🔄 System Updates",
    ],
  },
  {
    imgSrc: "/Intermediate.jpg",
    alt: "Personal Security",
    title: "Intermediate Level",
    description: "Have some tech knowledge? Enhance your security practices with comprehensive protection strategies for remote work and communications.",
    modules: [
      "🎣 Phishing Awareness",
      "✉️ Email Safety",
      "🏠 Remote Work Security",
      "📹 Conference Call Safety",
    ],
  },
  {
    imgSrc: "/Secure-Coding.jpg",
    alt: "Secure Development",
    title: "Advanced & Secure Coder",
    description: "Ready to code securely? Dive into advanced topics and use our AI Code Reviewer to analyze your code for vulnerabilities.",
    modules: [
      "🛡️ VPN Usage",
      "📶 Router Security",
      "AI-Powered Code Review",
      "Secure Development Practices",
    ],
  },
];

const subscriptionPlans = [
    {
        title: "Free Trial",
        price: "0",
        features: [
            "Full Content Access",
            "1 AI Code Review",
            "Perfect for Getting Started",
        ],
        featured: false,
    },
    {
        title: "Basic",
        price: "10",
        features: [
            "Full Content Access",
            "3 AI Code Reviews/Month",
            "Community Forum Support",
        ],
        featured: false,
    },
    {
        title: "Pro",
        price: "20",
        features: [
            "Full Content Access",
            "10 AI Code Reviews/Month",
            "Priority Email Support",
        ],
        featured: true, 
    },
    {
        title: "Unlimited",
        price: "100",
        features: [
            "Full Content Access",
            "Unlimited AI Code Reviews",
            "Dedicated 1-on-1 Support",
        ],
        featured: false,
    },
];

const approachItems = [
    { icon: "bi-book-half", title: "Structured Learning", text: "Follow a clear path from fundamental concepts to advanced skills." },
    { icon: "bi-shield-check", title: "Practical Application", text: "Apply what you learn in real-world scenarios and challenges." },
    { icon: "bi-people-fill", title: "Community Support", text: "Engage with peers and mentors in a collaborative environment." },
];

const testimonials = [
    { quote: "Securify transformed my understanding of security. The practical modules are a game-changer!", author: "Alex Johnson, Web Developer" },
    { quote: "As a beginner, I found the learning content incredibly accessible and empowering. Highly recommended!", author: "Maria Garcia, Student" },
    { quote: "The best platform for learning secure coding practices. The AI code reviewer is brilliant.", author: "David Chen, Software Engineer" },
];


export function Welcome() {
  const navigate = useNavigate();

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      const navbarHeight = 70;
      const elementPosition = section.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="welcome-page">
      <nav className="navbar glass-navbar navbar-expand-lg navbar-dark fixed-top">
        <div className="container-fluid ps-5 ">
          <NavLink className="navbar-brand navlogo" to="/">
            <img
              src="/logo.png"
              alt="Securify Logo"
              height="40"
              className="d-inline-block align-middle me-2"
            />
            Securify
          </NavLink>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto me-3 align-items-center">
              <li className="nav-item">
                <button className="nav-link" onClick={() => scrollToSection("home-section")}>Home</button>
              </li>
              <li className="nav-item">
                <button className="nav-link" onClick={() => scrollToSection("services-section")}>Learning Paths</button>
              </li>
              <li className="nav-item">
                <button className="nav-link" onClick={() => scrollToSection("code-review-section")}>AI Code Review</button>
              </li>
              <li className="nav-item">
                <button className="nav-link" onClick={() => scrollToSection("sponsors-section")}>Subscription</button>
              </li>
              <li className="nav-item ms-lg-2">
                <button
                  className="btn btn-primary"
                  onClick={() => navigate("/register")}
                >
                  Register
                </button>
              </li>
              <li className="nav-item ms-lg-2">
                <button
                  className="btn btn-outline-light"
                  onClick={() => navigate("/login")}
                >
                  Sign In
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <section id="home-section" className="hero-section vh-100 d-flex align-items-center">
            <div className="container">
              <div className="row align-items-center">
                <div className="col-lg-7">
                  <div className="hero-content-panel">
                    <h1 className="display-3 fw-bolder hero-title gradient-text">
                      Your Shield in the Digital World
                    </h1>
                    <p className="lead fs-4 my-4 hero-subtitle">
                      Master cybersecurity with guided learning paths, from foundational principles to advanced secure development.
                    </p>
                    <button
                      className="btn btn-primary btn-lg mt-4 px-5 py-3 fw-bold hero-button"
                      onClick={() => navigate("/register")}
                    >
                      Start Your Free Trial
                    </button>
                  </div>
                </div>
                <div className="col-lg-5 d-none d-lg-block">
                  <img
                    src="/logo.png"
                    alt="Cybersecurity Shield"
                    className="img-fluid hero-image"
                  />
                </div>
              </div>
            </div>
        </section>

        <hr className="section-divider" />

        <section id="services-section" className="page-section">
            <div className="container">
                <div className="text-center mb-5">
                    <h2 className="section-heading">Our Learning Paths</h2>
                    <p className="section-subheading">Choose the track that fits your needs and experience level.</p>
                </div>
                <div className="row g-4 justify-content-center">
                   {learningPaths.map((path, index) => (
                     <div className="col-md-6 col-lg-4 d-flex align-items-stretch" key={index}>
                        <div className="service-card">
                            <img src={path.imgSrc} className="card-img-top" alt={path.alt} />
                            <div className="card-body d-flex flex-column">
                                <h3 className="card-title">{path.title}</h3>
                                <p>{path.description}</p>
                                <h5 className="mt-auto pt-3">Example Modules:</h5>
                                <ul className="list-unstyled modules-list">
                                    {path.modules.map((mod, i) => <li key={i}><i className="bi bi-check-circle-fill me-2"></i>{mod}</li>)}
                                </ul>
                            </div>
                        </div>
                     </div>
                   ))}
                </div>
            </div>
        </section>
        
        <hr className="section-divider" />

        <section id="code-review-section" className="page-section">
            <div className="container">
                <div className="row align-items-center g-5">
                    <div className="col-lg-6">
                        <div className="code-review-panel">
                            <h2 className="section-heading">AI-Powered Code Analysis</h2>
                            <p className="lead">Go beyond traditional linting. Our AI assistant analyzes your code for complex security vulnerabilities and offers actionable advice.</p>
                            <ul className="list-unstyled modules-list mt-4 fs-5">
                                <li><i className="bi bi-shield-check me-2"></i>Deep Vulnerability Detection</li>
                                <li><i className="bi bi-lightning-charge-fill me-2"></i>Instantaneous Feedback</li>
                                <li><i className="bi bi-card-text me-2"></i>Line-by-Line Explanations</li>
                                <li><i className="bi bi-book-half me-2"></i>Educational & Actionable Advice</li>
                            </ul>
                        </div>
                    </div>
                     <div className="col-lg-6">
                        <img src="/code-review.webp" alt="AI Code Review" className="img-fluid code-review-image"/>
                    </div>
                </div>
            </div>
        </section>

        <hr className="section-divider" />

        <section id="sponsors-section" className="page-section">
            <div className="container">
                <div className="text-center mb-5">
                    <h2 className="section-heading">Subscription Plans</h2>
                    <p className="section-subheading">Support our mission and unlock powerful features by choosing a plan.</p>
                </div>
                <div className="row g-4 justify-content-center">
                    {subscriptionPlans.map((plan, index) => (
                        <div className="col-lg-3 col-md-6 d-flex align-items-stretch" key={index}>
                            <div className={`sponsor-card ${plan.featured ? 'featured' : ''}`}>
                                {plan.featured && <div className="popular-ribbon"><span>POPULAR</span></div>}
                                <div className="card-body text-center d-flex flex-column">
                                    <h3 className="card-title">{plan.title}</h3>
                                    <div className="my-4">
                                        <span className="plan-price">${plan.price}</span>
                                        <span className="text-secondary">/month</span>
                                    </div>
                                    <ul className="list-unstyled modules-list text-start mb-4">
                                        {plan.features.map((feature, i) => (
                                            <li key={i}><i className="bi bi-check-circle-fill me-2"></i>{feature}</li>
                                        ))}
                                    </ul>
                                    <button 
                                      className="btn btn-primary mt-auto" 
                                      onClick={() => navigate("/subscription")}
                                    >
                                        Choose Plan
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        <hr className="section-divider" />

        <section id="insights-section" className="page-section">
            <div className="container">
              <div className="glass-panel">
                <div className="row align-items-center g-5">
                  <div className="col-lg-6">
                    <img
                      src="/HumanFactor.png"
                      alt="Human factor in cybersecurity"
                      className="img-fluid rounded-3 shadow-lg"
                    />
                  </div>
                  <div className="col-lg-6">
                    <h2 className="section-heading">The Human Factor</h2>
                    <p className="lead">Technology alone is not enough. People are the first and last line of defense in cybersecurity.</p>
                    <p>While technical exploits are complex, many breaches begin by targeting human psychology. Our curriculum is built on the principle of strengthening this "human firewall" by fostering awareness and critical thinking.</p>
                    <div className="quote-box mt-4">
                      <p className="fst-italic mb-0">"The most dangerous threat is the one that convinces you to open the door yourself."</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </section>
        
        <hr className="section-divider" />

        <section id="approach-section" className="page-section">
             <div className="container">
                <div className="text-center mb-5">
                    <h2 className="section-heading">A Modern Approach to Learning</h2>
                    <p className="section-subheading">We believe in a holistic learning experience.</p>
                </div>
                <div className="row text-center g-4">
                    {approachItems.map((item, index) => (
                        <div className="col-md-4 d-flex align-items-stretch" key={index}>
                            <div className="approach-item">
                                <div className="approach-icon mb-3">
                                    <i className={`bi ${item.icon}`}></i>
                                </div>
                                <h4>{item.title}</h4>
                                <p>{item.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        <hr className="section-divider" />

        <section id="testimonials-section" className="page-section">
            <div className="container">
                <div className="text-center mb-5">
                    <h2 className="section-heading">What Our Users Say</h2>
                </div>
                <div className="row g-4">
                    {testimonials.map((testimonial, index) => (
                        <div className="col-md-4 d-flex align-items-stretch" key={index}>
                            <div className="testimonial-card">
                                <div className="card-body">
                                  <i className="bi bi-quote fs-1 text-primary"></i>
                                  <p className="testimonial-quote mt-3">"{testimonial.quote}"</p>
                                  <p className="testimonial-author mt-4">- {testimonial.author}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        <hr className="section-divider" />

        <section id="cta-section" className="page-section text-white text-center">
             <div className="container">
                <div className="cta-panel">
                  <h2 className="display-5 fw-bold">Ready to Fortify Your Digital Skills?</h2>
                  <p className="lead my-4">Join a community of learners dedicated to making the digital world a safer place.</p>
                  <button className="btn btn-primary btn-lg mt-3 px-5 py-3 fw-bold hero-button" onClick={() => navigate("/register")}>
                      Start Your Journey
                  </button>
                </div>
            </div>
        </section>
      </main>

      <footer className="main-footer text-white mt-auto">
         <div className="container py-5">
          <div className="row">
            <div className="col-12 text-center">
              <NavLink className="navbar-brand navlogo fs-2" to="/">
                <img src="/logo.png" alt="Securify Logo" height="50" className="d-inline-block align-middle me-2"/> Securify
              </NavLink>
              <p className="small my-3">Empowering digital security through education.</p>
              <p className="small mb-0">© {new Date().getFullYear()} FCAI Secure-Coding</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Welcome;