# ============================================================================
# EMOTIBOT BACKEND ENGINE
# Handles emotion analysis, response generation, and optional voice synthesis
# ============================================================================

import time
import random
import json
from datetime import datetime
import base64

# Optional: Google Generative AI or Gemini integration can go here
# Example placeholder to keep it modular
# from google.generativeai import GenerativeModel


# ============================================================================
# CONFIGURATION CLASS
# ============================================================================

class EmotiBotConfig:
    """Configuration for emotion profiles, colors, and styles."""
    
    EMOTIONS = {
        "joy": {
            "color": "#FFD700",
            "bg_gradient": "linear-gradient(135deg, #FFFACD, #FFD700)",
            "avatar": {"eyebrows": 0.8, "eyes": 0.7, "mouth": 0.9}
        },
        "sadness": {
            "color": "#1E90FF",
            "bg_gradient": "linear-gradient(135deg, #E0F7FF, #1E90FF)",
            "avatar": {"eyebrows": -0.6, "eyes": 0.4, "mouth": -0.5}
        },
        "anger": {
            "color": "#FF4500",
            "bg_gradient": "linear-gradient(135deg, #FFE0E0, #FF4500)",
            "avatar": {"eyebrows": -0.9, "eyes": 0.6, "mouth": -0.7}
        },
        "fear": {
            "color": "#8A2BE2",
            "bg_gradient": "linear-gradient(135deg, #E6E6FA, #8A2BE2)",
            "avatar": {"eyebrows": 0.3, "eyes": 0.2, "mouth": -0.4}
        },
        "trust": {
            "color": "#00B894",
            "bg_gradient": "linear-gradient(135deg, #D0F0C0, #00B894)",
            "avatar": {"eyebrows": 0.2, "eyes": 0.6, "mouth": 0.4}
        },
        "surprise": {
            "color": "#FF69B4",
            "bg_gradient": "linear-gradient(135deg, #FFD1DC, #FF69B4)",
            "avatar": {"eyebrows": 0.7, "eyes": 1.0, "mouth": 0.8}
        }
    }


# ============================================================================
# MAIN EMOTIBOT ENGINE
# ============================================================================

class EmotiBotEngine:
    """Main engine for processing messages, analyzing emotions, and generating responses."""
    
    def __init__(self, api_key: str = "YOUR_API_KEY_HERE"):
        self.api_key = api_key
        self.config = EmotiBotConfig()
        self.conversation_history = []
        self.analytics = {
            "emotion_distribution": {},
            "average_metrics": {
                "total_interactions": 0,
                "avg_response_time": 0,
                "avg_confidence": 0
            }
        }
    
    # ------------------------------------------------------------------------
    # Core Message Processing
    # ------------------------------------------------------------------------
    
    def process_message(self, text: str) -> dict:
        """Process text message and simulate emotion + response generation."""
        
        start_time = time.time()
        
        # Simulate emotion detection
        emotion = self._analyze_emotion(text)
        
        # Generate mock AI response
        response = self._generate_response(text, emotion)
        
        response_time = int((time.time() - start_time) * 1000)
        confidence = random.uniform(0.7, 0.98)
        quality_score = random.uniform(0.8, 1.0)
        
        # Simulated emotion probabilities
        all_emotions = {emo: random.random() for emo in self.config.EMOTIONS.keys()}
        total = sum(all_emotions.values())
        all_emotions = {k: v / total for k, v in all_emotions.items()}
        
        # Optional: generate placeholder audio
        audio = self._generate_mock_audio(response)
        
        result = {
            "response": response,
            "emotion": emotion,
            "response_time": response_time,
            "confidence": confidence * 100,
            "quality_score": quality_score * 100,
            "all_emotions": all_emotions,
            "audio": audio,
            "timestamp": datetime.now().isoformat(),
            "intensity": random.uniform(0.3, 1.0)
        }
        
        self._update_analytics(emotion, response_time, confidence)
        self.conversation_history.append(result)
        
        return result
    
    # ------------------------------------------------------------------------
    # Emotion Analysis (Simple Placeholder)
    # ------------------------------------------------------------------------
    
    def _analyze_emotion(self, text: str) -> str:
        """Very basic emotion detection logic (placeholder)."""
        text_lower = text.lower()
        if any(word in text_lower for word in ["happy", "great", "awesome", "fun"]):
            return "joy"
        elif any(word in text_lower for word in ["sad", "down", "unhappy", "cry"]):
            return "sadness"
        elif any(word in text_lower for word in ["angry", "mad", "furious"]):
            return "anger"
        elif any(word in text_lower for word in ["scared", "afraid", "fear"]):
            return "fear"
        elif any(word in text_lower for word in ["wow", "amazing", "unexpected"]):
            return "surprise"
        else:
            return "trust"
    
    # ------------------------------------------------------------------------
    # Response Generation
    # ------------------------------------------------------------------------
    
    def _generate_response(self, text: str, emotion: str) -> str:
        """Simulate AI response based on detected emotion."""
        templates = {
            "joy": "I'm so glad to hear that! 🌞",
            "sadness": "I'm here for you. It’s okay to feel down sometimes. 💙",
            "anger": "I can sense frustration — let’s take a deep breath together. 🔥",
            "fear": "You’re safe here. It’s natural to feel scared sometimes. 💜",
            "trust": "I understand. Let’s move forward with confidence. 💚",
            "surprise": "Oh wow! That’s unexpected but exciting! 🎉"
        }
        return templates.get(emotion, "I understand how you feel.")
    
    # ------------------------------------------------------------------------
    # Voice / Audio (Simulated)
    # ------------------------------------------------------------------------
    
    def _generate_mock_audio(self, text: str) -> str:
        """Simulate base64-encoded audio response (placeholder)."""
        fake_audio_data = f"Audio for: {text}"
        return base64.b64encode(fake_audio_data.encode()).decode()
    
    # ------------------------------------------------------------------------
    # Analytics and Export
    # ------------------------------------------------------------------------
    
    def _update_analytics(self, emotion: str, response_time: int, confidence: float):
        """Update internal analytics for visualization."""
        dist = self.analytics["emotion_distribution"]
        dist[emotion] = dist.get(emotion, 0) + 1
        
        metrics = self.analytics["average_metrics"]
        metrics["total_interactions"] += 1
        metrics["avg_response_time"] = (
            (metrics["avg_response_time"] * (metrics["total_interactions"] - 1) + response_time)
            / metrics["total_interactions"]
        )
        metrics["avg_confidence"] = (
            (metrics["avg_confidence"] * (metrics["total_interactions"] - 1) + confidence)
            / metrics["total_interactions"]
        )

    def get_emotion_distribution(self) -> dict:
        """Return the emotion distribution for analytics charts."""
        return self.analytics.get("emotion_distribution", {})

    def get_analytics(self) -> dict:
        """Return current analytics data."""
        return self.analytics
    
    def export_session(self) -> str:
        """Export the full conversation as a JSON string."""
        return json.dumps(self.conversation_history, indent=2)


# ============================================================================
# AUDIO PLAYER CREATOR
# ============================================================================

def create_audio_player(audio_data: str) -> str:
    """Generate HTML audio player for base64-encoded audio."""
    return f"""
    <audio controls>
        <source src="data:audio/wav;base64,{audio_data}" type="audio/wav">
        Your browser does not support audio playback.
    </audio>
    """


# ============================================================================
# END OF FILE
# ============================================================================
