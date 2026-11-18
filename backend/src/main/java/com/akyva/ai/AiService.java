package com.akyva.ai;

import com.akyva.dto.ai.SecurityCheckResponse;
import com.akyva.dto.ai.SummarizeResponse;

import java.util.List;

/**
 * Clean AI Service abstraction for AKYVA.
 * Provider-independent interface allowing pluggable AI engines (Gemini, Anthropic, OpenAI, Local LLMs).
 */
public interface AiService {

    /**
     * Generate 3-4 smart, contextual reply suggestions.
     * Note: Suggestions are advisory; users must actively select before sending.
     */
    List<String> generateReplySuggestions(String lastMessage, List<String> recentMessages);

    /**
     * Translate message content to target language.
     * Supports English, Tamil, Hindi, Telugu, Kannada, Malayalam, Bengali, Marathi, Gujarati, Punjabi, and global languages.
     */
    String translateMessage(String text, String sourceLanguage, String targetLanguage);

    /**
     * Rewrite draft message into desired tone (Professional, Friendly, Shorter, Clearer).
     */
    String rewriteMessage(String text, String tone);

    /**
     * Summarize a conversation into executive overview, key points, and action items.
     */
    SummarizeResponse summarizeConversation(List<String> messages);

    /**
     * Detect spam, phishing, scam links, and deceptive urgency.
     */
    SecurityCheckResponse detectSuspiciousContent(String text);
}
