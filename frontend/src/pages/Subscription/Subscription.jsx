import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink, useLocation } from 'react-router-dom';
import './Subscription.css';


const plans = [
    { id: 'free_trial', name: 'Free Trial', price: 0, reviews: 1 },
    { id: 'basic', name: 'Basic', price: 10, reviews: 3 },
    { id: 'pro', name: 'Pro', price: 20, reviews: 10 },
    { id: 'unlimited', name: 'Unlimited', price: 100, reviews: Infinity }
];

function Subscription() {
    const navigate = useNavigate();
    const location = useLocation();
    const [currentPlanId, setCurrentPlanId] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (location.state?.message) {
            setMessage(location.state.message);
        }
        const subscription = JSON.parse(localStorage.getItem('subscription'));
        if (subscription) {
            setCurrentPlanId(subscription.plan);
        }
    }, [location.state]);

    const handleSubscribe = (plan) => {
        const subscriptionData = {
            plan: plan.id,
            reviewsRemaining: plan.reviews
        };
        localStorage.setItem('subscription', JSON.stringify(subscriptionData));
        setCurrentPlanId(plan.id);
        
        if (localStorage.getItem('user')) {
            navigate('/training');
        } else {
            navigate('/login', { state: { message: "Plan selected! Please log in to continue." } });
        }
    };

    return (
        <div className="subscription-page-wrapper">
             <nav className="navbar navbar-dark bg-transparent">
                <div className="container-fluid">
                    <NavLink className="navbar-brand me-auto navlogo" to="/">
                      <img src="/logo.png" alt="Securify Logo" height="50" className="d-inline-block align-text-top me-2" />
                      Securify
                    </NavLink>
                </div>
             </nav>
            <div className="container mt-4">
                <div className="text-center mb-5">
                    <h1 className="display-4 fw-bold">Choose Your Plan</h1>
                    {message && <p className="lead text-success">{message}</p>}
                </div>
                <div className="row">
                    {plans.map(plan => {
                        const isCurrentPlan = currentPlanId === plan.id;
                        return (
                            <div key={plan.id} className="col-md-3 d-flex">
                                <div className={`plan-card ${plan.id === 'free_trial' ? 'free-trial-card' : ''}`}>
                                    <div>
                                        <h2 className="fw-normal">{plan.name}</h2>
                                        <h1 className="card-title pricing-card-title">${plan.price}<small className="text-muted fw-light">/mo</small></h1>
                                        <ul className="list-unstyled mt-3 mb-4">
                                            <li>Full Content Access</li>
                                            <li>{plan.id === 'unlimited' ? 'Unlimited' : `${plan.reviews} Code Reviews`}</li>
                                            <li>AI-Powered Analysis</li>
                                            {plan.id === 'free_trial' && <li><small className="text-muted">Perfect for getting started!</small></li>}
                                        </ul>
                                    </div>
                                    <button
                                        type="button"
                                        className={`subscribe-btn ${isCurrentPlan ? 'repurchase-btn' : ''}`}
                                        onClick={() => handleSubscribe(plan)}
                                    >
                                        {isCurrentPlan ? 'Current Plan' : (plan.price === 0 ? 'Start Trial' : 'Subscribe')}
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
}

export default Subscription;