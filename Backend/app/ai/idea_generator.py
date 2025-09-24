def suggest_ideas(preferred_domain: str = None):
    # Dummy scoring system (later replace with ML)
    ideas = {
        "AI": ["AI-powered healthcare assistant", "Predictive analytics for logistics"],
        "Fintech": ["Micro-investment platform", "AI fraud detection"],
        "Healthtech": ["Remote patient monitoring", "AI drug discovery"],
        "Logistics": ["Smart warehouse automation", "Delivery optimization AI"],
    }

    if preferred_domain and preferred_domain in ideas:
        return ideas[preferred_domain]

    # Return top ideas across domains
    return [val for sublist in ideas.values() for val in sublist][:5]
