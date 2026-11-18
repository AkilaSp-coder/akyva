package com.akyva.ai;

import com.akyva.dto.ai.SecurityCheckResponse;
import com.akyva.dto.ai.SummarizeResponse;
import com.akyva.entity.enums.RiskLevel;
import org.springframework.stereotype.Service;

import java.util.*;

@Service("mockAiService")
public class MockAiService implements AiService {

    private static final Map<String, Map<String, String>> PHRASE_TRANSLATIONS = new HashMap<>();

    static {
        Map<String, String> tamil = new HashMap<>();
        tamil.put("how are you?", "நீங்கள் எப்படி இருக்கிறீர்கள்?");
        tamil.put("hello", "வணக்கம்");
        tamil.put("thank you", "நன்றி");
        tamil.put("sounds good", "மிக நன்று, சரி");
        tamil.put("i will check", "நான் சரிபார்க்கிறேன்");
        PHRASE_TRANSLATIONS.put("tamil", tamil);

        Map<String, String> hindi = new HashMap<>();
        hindi.put("how are you?", "आप कैसे हैं?");
        hindi.put("hello", "नमस्ते");
        hindi.put("thank you", "धन्यवाद");
        hindi.put("sounds good", "बढ़िया है");
        hindi.put("i will check", "मैं देखूँगा");
        PHRASE_TRANSLATIONS.put("hindi", hindi);

        Map<String, String> telugu = new HashMap<>();
        telugu.put("how are you?", "మీరు ఎలా ఉన్నారు?");
        telugu.put("hello", "నమస్కారం");
        telugu.put("thank you", "ధన్యవాదాలు");
        PHRASE_TRANSLATIONS.put("telugu", telugu);
    }

    @Override
    public List<String> generateReplySuggestions(String lastMessage, List<String> recentMessages) {
        String lower = (lastMessage != null) ? lastMessage.toLowerCase().trim() : "";

        if (lower.contains("?")) {
            return List.of("Sure, I'll check right now.", "Sounds good!", "Could you clarify?", "Let's discuss this soon.");
        } else if (lower.contains("thank") || lower.contains("thx")) {
            return List.of("You're most welcome!", "Anytime!", "Glad I could help!");
        } else if (lower.contains("meet") || lower.contains("call") || lower.contains("schedule")) {
            return List.of("Sounds great, I'm available.", "What time works best for you?", "Let me confirm my calendar.");
        } else if (lower.contains("urgent") || lower.contains("asap")) {
            return List.of("On it right now!", "Understood, handling this immediately.", "I'll update you in 10 minutes.");
        }

        return List.of("Sounds good!", "Sure, I'll check.", "Thank you!", "I'll get back to you shortly.");
    }

    @Override
    public String translateMessage(String text, String sourceLanguage, String targetLanguage) {
        if (text == null || text.isBlank()) {
            return "";
        }
        String targetKey = targetLanguage.toLowerCase().trim();
        Map<String, String> dictionary = PHRASE_TRANSLATIONS.get(targetKey);
        if (dictionary != null) {
            String lower = text.toLowerCase().trim();
            if (dictionary.containsKey(lower)) {
                return dictionary.get(lower);
            }
        }
        return "[" + targetLanguage + "] " + text;
    }

    @Override
    public String rewriteMessage(String text, String tone) {
        if (text == null || text.isBlank()) {
            return text;
        }
        String trimmed = text.trim();
        switch (tone.toLowerCase()) {
            case "professional":
                return "Good day, I would like to confirm that " + Character.toLowerCase(trimmed.charAt(0)) + trimmed.substring(1) + ". Please let me know if you require further details.";
            case "friendly":
                return "Hey! Just wanted to share that " + Character.toLowerCase(trimmed.charAt(0)) + trimmed.substring(1) + " 😊 Hope you're having a wonderful day!";
            case "shorter":
                return trimmed.length() > 25 ? trimmed.substring(0, Math.min(trimmed.length(), 40)) + "..." : trimmed;
            case "clearer":
                return "To clarify: " + trimmed + ". Let me know if that makes complete sense.";
            default:
                return trimmed;
        }
    }

    @Override
    public SummarizeResponse summarizeConversation(List<String> messages) {
        return SummarizeResponse.builder()
                .overview("Discussion regarding project deliverables, timelines, and next steps.")
                .keyPoints(List.of(
                        "Meeting scheduled for Friday morning",
                        "Arun will prepare the preliminary document",
                        "Priya will review and provide feedback",
                        "Final submission deadline is Saturday 5:00 PM"
                ))
                .actionItems(List.of(
                        "Review draft documentation by Thursday EOD",
                        "Align on multilingual translation quality metrics"
                ))
                .fullSummary("The conversation aligned team members on upcoming deadlines, assigned drafting to Arun, review to Priya, and confirmed final submission for Saturday.")
                .build();
    }

    @Override
    public SecurityCheckResponse detectSuspiciousContent(String text) {
        if (text == null) {
            return SecurityCheckResponse.builder()
                    .riskLevel(RiskLevel.LOW)
                    .isSuspicious(false)
                    .reason("No content to analyze.")
                    .recommendedAction("Safe to proceed.")
                    .build();
        }

        String lower = text.toLowerCase();
        boolean hasUrgency = lower.contains("send money") || lower.contains("wire transfer") || lower.contains("gift card") ||
                lower.contains("claim your prize") || lower.contains("bank account password") || lower.contains("otp");
        boolean hasSuspiciousUrl = lower.contains("http://") || lower.contains("bit.ly") || lower.contains("tinyurl") || lower.contains(".xyz");

        if (hasUrgency && hasSuspiciousUrl) {
            return SecurityCheckResponse.builder()
                    .riskLevel(RiskLevel.HIGH)
                    .isSuspicious(true)
                    .reason("High probability phishing attempt: Contains urgent financial solicitation and unverified short link.")
                    .recommendedAction("Do not click links or share credentials. Block and report sender.")
                    .build();
        } else if (hasUrgency) {
            return SecurityCheckResponse.builder()
                    .riskLevel(RiskLevel.MEDIUM)
                    .isSuspicious(true)
                    .reason("Potential financial scam: Requests sensitive credentials, OTP, or rapid payment.")
                    .recommendedAction("Verify sender identity via voice or secondary channel before taking action.")
                    .build();
        } else if (hasSuspiciousUrl) {
            return SecurityCheckResponse.builder()
                    .riskLevel(RiskLevel.MEDIUM)
                    .isSuspicious(true)
                    .reason("External link detected from unverified URL shortener.")
                    .recommendedAction("Exercise caution before opening unknown links.")
                    .build();
        }

        return SecurityCheckResponse.builder()
                .riskLevel(RiskLevel.LOW)
                .isSuspicious(false)
                .reason("No suspicious patterns or threat indicators detected.")
                .recommendedAction("Safe to communicate.")
                .build();
    }
}
