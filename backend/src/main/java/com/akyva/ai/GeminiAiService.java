package com.akyva.ai;

import com.akyva.dto.ai.SecurityCheckResponse;
import com.akyva.dto.ai.SummarizeResponse;
import com.akyva.entity.enums.RiskLevel;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.*;

@Slf4j
@Service("geminiAiService")
@Primary
public class GeminiAiService implements AiService {

    private final MockAiService mockFallback;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    @Value("${akyva.ai.gemini.api-key:}")
    private String apiKey;

    @Value("${akyva.ai.gemini.model:gemini-2.5-flash}")
    private String model;

    public GeminiAiService(MockAiService mockFallback, ObjectMapper objectMapper) {
        this.mockFallback = mockFallback;
        this.objectMapper = objectMapper;
        this.restClient = RestClient.builder().build();
    }

    private boolean isApiKeyConfigured() {
        return apiKey != null && !apiKey.isBlank() && !apiKey.equals("MY_GEMINI_API_KEY");
    }

    private String callGemini(String prompt) {
        if (!isApiKeyConfigured()) {
            return null;
        }

        try {
            String url = String.format("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s", model, apiKey);

            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(
                            Map.of("parts", List.of(Map.of("text", prompt)))
                    )
            );

            String responseStr = restClient.post()
                    .uri(url)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(responseStr);
            JsonNode textNode = root.path("candidates").path(0).path("content").path("parts").path(0).path("text");
            if (!textNode.isMissingNode()) {
                return textNode.asText().trim();
            }
        } catch (Exception ex) {
            log.warn("Gemini API call failed or quota exceeded: {}. Falling back to safe mock AI response.", ex.getMessage());
        }
        return null;
    }

    @Override
    public List<String> generateReplySuggestions(String lastMessage, List<String> recentMessages) {
        if (isApiKeyConfigured()) {
            try {
                String prompt = "You are AKYVA AI Assistant for messaging. Provide 3 or 4 concise, polite, natural conversational reply suggestions (maximum 6 words each) for someone replying to this message: \"" +
                        lastMessage + "\". Return ONLY a raw JSON array of strings like [\"Sure, I will check.\", \"Sounds great!\", \"Thank you!\"]. Do not wrap in markdown fences.";
                String result = callGemini(prompt);
                if (result != null) {
                    String cleaned = result.replace("```json", "").replace("```", "").trim();
                    JsonNode node = objectMapper.readTree(cleaned);
                    if (node.isArray()) {
                        List<String> list = new ArrayList<>();
                        for (JsonNode item : node) {
                            list.add(item.asText());
                        }
                        if (!list.isEmpty()) {
                            return list;
                        }
                    }
                }
            } catch (Exception ex) {
                log.warn("Failed parsing Gemini reply suggestions: {}", ex.getMessage());
            }
        }
        return mockFallback.generateReplySuggestions(lastMessage, recentMessages);
    }

    @Override
    public String translateMessage(String text, String sourceLanguage, String targetLanguage) {
        if (isApiKeyConfigured()) {
            try {
                String prompt = String.format("Translate the following message into %s. Preserve conversational nuance and emotion. Return ONLY the translated text without commentary or quotation marks:\n\n%s", targetLanguage, text);
                String result = callGemini(prompt);
                if (result != null && !result.isBlank()) {
                    return result;
                }
            } catch (Exception ex) {
                log.warn("Failed Gemini translation: {}", ex.getMessage());
            }
        }
        return mockFallback.translateMessage(text, sourceLanguage, targetLanguage);
    }

    @Override
    public String rewriteMessage(String text, String tone) {
        if (isApiKeyConfigured()) {
            try {
                String prompt = String.format("Rewrite the following text to make it '%s'. Return ONLY the rewritten message without any prefixes or explanations:\n\n%s", tone, text);
                String result = callGemini(prompt);
                if (result != null && !result.isBlank()) {
                    return result;
                }
            } catch (Exception ex) {
                log.warn("Failed Gemini rewrite: {}", ex.getMessage());
            }
        }
        return mockFallback.rewriteMessage(text, tone);
    }

    @Override
    public SummarizeResponse summarizeConversation(List<String> messages) {
        if (isApiKeyConfigured()) {
            try {
                String transcripts = String.join("\n- ", messages);
                String prompt = "Summarize the following chat conversation into an executive overview, bullet points of key takeaways, and action items.\n" +
                        "Respond ONLY in valid JSON matching this structure:\n" +
                        "{\"overview\":\"...\", \"keyPoints\":[\"...\", \"...\"], \"actionItems\":[\"...\", \"...\"], \"fullSummary\":\"...\"}\n\nChat:\n" + transcripts;
                String result = callGemini(prompt);
                if (result != null) {
                    String cleaned = result.replace("```json", "").replace("```", "").trim();
                    return objectMapper.readValue(cleaned, SummarizeResponse.class);
                }
            } catch (Exception ex) {
                log.warn("Failed Gemini summarize: {}", ex.getMessage());
            }
        }
        return mockFallback.summarizeConversation(messages);
    }

    @Override
    public SecurityCheckResponse detectSuspiciousContent(String text) {
        if (isApiKeyConfigured()) {
            try {
                String prompt = "Analyze the following message for spam, phishing, financial fraud, scam links, or malicious urgency.\n" +
                        "Respond ONLY with a valid JSON object matching:\n" +
                        "{\"riskLevel\":\"LOW|MEDIUM|HIGH\", \"isSuspicious\":true|false, \"reason\":\"...\", \"recommendedAction\":\"...\"}\n\nMessage:\n" + text;
                String result = callGemini(prompt);
                if (result != null) {
                    String cleaned = result.replace("```json", "").replace("```", "").trim();
                    JsonNode node = objectMapper.readTree(cleaned);
                    RiskLevel level = RiskLevel.valueOf(node.path("riskLevel").asText("LOW").toUpperCase());
                    return SecurityCheckResponse.builder()
                            .riskLevel(level)
                            .isSuspicious(node.path("isSuspicious").asBoolean(level != RiskLevel.LOW))
                            .reason(node.path("reason").asText("Analysis complete."))
                            .recommendedAction(node.path("recommendedAction").asText("Safe to proceed."))
                            .build();
                }
            } catch (Exception ex) {
                log.warn("Failed Gemini security check: {}", ex.getMessage());
            }
        }
        return mockFallback.detectSuspiciousContent(text);
    }
}
