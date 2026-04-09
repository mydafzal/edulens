# CurricuLLM API — Official Documentation (Parsed from documentation.htm)

> Source: CurricuLLM OpenAPI Specification v1.1.0
> Parsed from the official Swagger/OpenAPI HTML documentation

---

## Overview

| Field | Value |
|-------|-------|
| **API Version** | 1.1.0 |
| **OpenAPI Version** | 3.1.0 |
| **Base URL** | `https://api.curricullm.com` |
| **Console** | `https://console.curricullm.com` |
| **Support** | helpdesk@curricullm.com |
| **Raw Spec** | `https://console.curricullm.com/api/openapi-spec` |

**Description:** OpenAI-compatible Chat Completions API optimized for educational content generation and pedagogical applications. Supports streaming responses, function calling, and structured outputs.

---

## Authentication

| Field | Value |
|-------|-------|
| **Type** | HTTP Bearer Token |
| **Scheme** | `bearer` |
| **Format** | JWT |
| **Header** | `Authorization: Bearer <your-api-key>` |
| **Manage Keys** | `https://console.curricullm.com/keys` |
| **Billing** | `https://console.curricullm.com/billing` |
| **Usage Dashboard** | `https://console.curricullm.com/usage` |

---

## Available Models

| Model ID | Region / Curriculum |
|----------|-------------------|
| `CurricuLLM-AU` | Australia — General / National Curriculum |
| `CurricuLLM-AU-VIC` | Australia — Victoria Specific |
| `CurricuLLM-AU-WA` | Australia — Western Australia Specific |
| `CurricuLLM-NZ` | New Zealand |

---

## Single Endpoint

There is exactly **one endpoint** in the entire API:

```
POST /v1/chat/completions
```

**Operation ID:** `createChatCompletion`
**Tag:** Chat
**Summary:** Create chat completion
**Description:** Creates a model response for the given chat conversation. Supports both streaming and non-streaming responses.

---

## Request Body

**Content-Type:** `application/json` (required)

### Full Request Schema (`CreateChatCompletionRequest`)

| Field | Type | Required | Default | Constraints | Description |
|-------|------|----------|---------|-------------|-------------|
| `model` | string (enum) | **Yes** | — | `CurricuLLM-AU`, `CurricuLLM-AU-VIC`, `CurricuLLM-AU-WA`, `CurricuLLM-NZ` | Model to use |
| `messages` | array of `ChatCompletionRequestMessage` | **Yes** | — | minItems: 1 | Conversation history |
| `stream` | boolean | No | `false` | — | Enable streaming partial deltas via SSE |
| `temperature` | number | No | `1` | min: 0, max: 2 | Sampling temperature. Lower = more focused. |
| `top_p` | number | No | `1` | min: 0, max: 1 | Nucleus sampling |
| `max_tokens` | integer | No | — | min: 1 | Max tokens to generate |
| `presence_penalty` | number | No | `0` | min: -2, max: 2 | Penalize new tokens based on presence in text so far |
| `frequency_penalty` | number | No | `0` | min: -2, max: 2 | Penalize tokens based on frequency in text so far |
| `response_format` | object | No | — | See below | Output format control (text or JSON mode) |
| `tools` | array of `ChatCompletionTool` | No | — | See below | Tools/functions the model may call |
| `tool_choice` | string or object | No | — | See below | Control tool calling behavior |
| `curriculum` | object | No | — | See below | **CurricuLLM-unique** — Educational curriculum context |

### Example Request

```json
{
  "model": "CurricuLLM-AU",
  "messages": [
    { "role": "system", "content": "You are an educational content expert." },
    { "role": "user", "content": "Create a lesson plan on water scarcity for Year 9 Geography." }
  ],
  "temperature": 0.3,
  "max_tokens": 2048,
  "curriculum": {
    "stage": "Stage 3",
    "subject": "Geography"
  },
  "response_format": { "type": "json_object" }
}
```

---

## `curriculum` Parameter (CurricuLLM-Unique)

This is the **key differentiator** from standard OpenAI. It tells CurricuLLM what educational context to use for generating responses.

```json
"curriculum": {
  "stage": "Stage 3",
  "subject": "Mathematics"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `stage` | string | No | Educational stage / grade level. Free-form string. |
| `subject` | string | No | Subject area. Free-form string. |

**Stage examples:** `"Stage 3"`, `"Stage 4"`, `"Foundation to Year 2"`, `"Years 7 to 9"`, etc.
**Subject examples:** `"Mathematics"`, `"Science"`, `"Geography"`, `"History"`, `"English"`, etc.

> Note: These are free-form strings — no enforced enum. CurricuLLM interprets them based on the selected model's curriculum jurisdiction.

### How EduLens Maps Grade Levels to `curriculum.stage`

| EduLens Grade Level | `curriculum.stage` Value |
|--------------------|------------------------|
| `early-years` | `"Foundation to Year 2"` |
| `primary` | `"Years 3 to 6"` |
| `middle` | `"Years 7 to 9"` |
| `senior` | `"Years 10 to 12"` |
| `tertiary` | `"Tertiary"` |

---

## Message Types (`ChatCompletionRequestMessage`)

Four message roles (oneOf):

### 1. System Message
```json
{ "role": "system", "content": "You are an expert educator..." }
```
| Field | Type | Required |
|-------|------|----------|
| `role` | `"system"` | Yes |
| `content` | string | Yes |

### 2. User Message
```json
{ "role": "user", "content": "Explain photosynthesis for Year 5 students.", "name": "teacher_jane" }
```
| Field | Type | Required |
|-------|------|----------|
| `role` | `"user"` | Yes |
| `content` | string | Yes |
| `name` | string | No |

### 3. Assistant Message
```json
{ "role": "assistant", "content": "Photosynthesis is the process by which..." }
```
| Field | Type | Required |
|-------|------|----------|
| `role` | `"assistant"` | Yes |
| `content` | string | Yes |
| `tool_calls` | array of `ChatCompletionMessageToolCall` | No |

### 4. Tool Message (function call result)
```json
{ "role": "tool", "tool_call_id": "call_abc123", "content": "{\"result\": \"data\"}" }
```
| Field | Type | Required |
|-------|------|----------|
| `role` | `"tool"` | Yes |
| `tool_call_id` | string | Yes |
| `content` | string | Yes |

---

## Response Format (JSON Mode / Structured Output)

Controlled via the `response_format` field. Two options:

### Option 1 — Text Mode (default)
```json
{ "type": "text" }
```

### Option 2 — JSON Object Mode
```json
{
  "type": "json_object",
  "json_schema": {
    "type": "object",
    "properties": {
      "summary": { "type": "string" },
      "rating": { "type": "number" }
    }
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `"json_object"` | Yes | Forces JSON output |
| `json_schema` | object | No | Optional JSON Schema defining the desired response structure |

> When using `json_object` mode, the model will always return valid JSON. If `json_schema` is provided, the response will conform to that schema.

---

## Function Calling / Tool Use

Fully supported. Uses the OpenAI-compatible format.

### Defining Tools

```json
{
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "search_curriculum",
        "description": "Search for curriculum standards by topic and year level",
        "parameters": {
          "type": "object",
          "properties": {
            "topic": { "type": "string", "description": "The topic to search for" },
            "year_level": { "type": "integer", "description": "Year level (1-12)" }
          },
          "required": ["topic"]
        }
      }
    }
  ]
}
```

### Tool Schema (`ChatCompletionTool`)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `"function"` | Yes | Always `"function"` |
| `function.name` | string | Yes | Function name |
| `function.description` | string | Yes | What the function does |
| `function.parameters` | object | No | JSON Schema for function parameters |

### Tool Choice

Controls when/how the model calls tools:

| Value | Behavior |
|-------|----------|
| `"none"` | Model will NOT call any tools |
| `"auto"` | Model decides whether to call tools |
| `"required"` | Model MUST call at least one tool |
| `{ "type": "function", "function": { "name": "specific_fn" } }` | Force model to call a specific function |

### Tool Call Response

When the model wants to call a tool, the response includes:

```json
{
  "choices": [{
    "message": {
      "role": "assistant",
      "content": null,
      "tool_calls": [
        {
          "id": "call_abc123",
          "type": "function",
          "function": {
            "name": "search_curriculum",
            "arguments": "{\"topic\": \"photosynthesis\", \"year_level\": 7}"
          }
        }
      ]
    },
    "finish_reason": "tool_calls"
  }]
}
```

`finish_reason` will be `"tool_calls"` when the model wants to call tools.

---

## Streaming

Set `"stream": true` in the request. Response switches from `application/json` to `text/event-stream` (Server-Sent Events).

### Stream Response Schema (`CreateChatCompletionStreamResponse`)

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique completion ID |
| `object` | `"chat.completion.chunk"` | Always this value for streaming |
| `created` | integer | Unix timestamp |
| `model` | string | Model used |
| `choices` | array of `ChatCompletionStreamChoice` | Stream choices |

### Stream Choice

| Field | Type | Description |
|-------|------|-------------|
| `index` | integer | Choice index |
| `delta` | object | **Partial content** (not full message) |
| `delta.role` | string | Only present in first chunk |
| `delta.content` | string | Partial text content |
| `delta.tool_calls` | array | Partial tool call data |
| `finish_reason` | string or `null` | `null` for intermediate chunks; `"stop"`, `"length"`, `"tool_calls"`, or `"content_filter"` for final chunk |

### Key Difference from Non-Streaming
- Non-streaming uses `message` (complete content)
- Streaming uses `delta` (partial content, concatenate all deltas to get full response)

---

## Response Schema (Non-Streaming)

### `CreateChatCompletionResponse`

```json
{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1699000000,
  "model": "CurricuLLM-AU",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Here is your lesson plan..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 150,
    "completion_tokens": 500,
    "total_tokens": 650,
    "run_id": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique completion identifier |
| `object` | `"chat.completion"` | Yes | Object type |
| `created` | integer | Yes | Unix timestamp (seconds) |
| `model` | string | Yes | Model used |
| `choices` | array | Yes | Completion choices |
| `usage` | object | No | Token usage statistics |

### Choice Object

| Field | Type | Description |
|-------|------|-------------|
| `index` | integer | Choice index |
| `message` | object | The completion message |
| `finish_reason` | enum | `"stop"` / `"length"` / `"tool_calls"` / `"content_filter"` |

### Finish Reasons

| Reason | Meaning |
|--------|---------|
| `stop` | Model finished naturally or hit a stop sequence |
| `length` | Hit `max_tokens` limit |
| `tool_calls` | Model wants to call one or more tools |
| `content_filter` | Content was filtered (safety) |

### Usage Object (includes CurricuLLM-unique `run_id`)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `prompt_tokens` | integer | Yes | Tokens in the prompt |
| `completion_tokens` | integer | Yes | Tokens in the completion |
| `total_tokens` | integer | Yes | Total tokens used |
| `run_id` | string (UUID) | No | **CurricuLLM-unique** — Unique identifier for this request run, used for tracking and analytics |

---

## Error Response

```json
{
  "error": {
    "message": "Invalid API key provided",
    "type": "authentication_error",
    "param": null,
    "code": "invalid_api_key"
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `error.message` | string | Yes | Human-readable error message |
| `error.type` | string | Yes | Error type category |
| `error.param` | string | No | Parameter that caused the error |
| `error.code` | string | No | Error code |

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `400` | Bad Request — Invalid parameters or malformed request |
| `401` | Unauthorized — Invalid or missing API key |
| `429` | Rate Limited — Too many requests |
| `500` | Internal Server Error |

---

## CurricuLLM-Unique Features (Not in Standard OpenAI)

### 1. `curriculum` Parameter
An optional object on the request with `stage` and `subject` fields. Tailors responses to specific educational stages and subject areas. No other LLM API has this.

### 2. Region-Specific Models
Models named by curriculum jurisdiction:
- `CurricuLLM-AU` — Australian national curriculum
- `CurricuLLM-AU-VIC` — Victoria-specific
- `CurricuLLM-AU-WA` — Western Australia-specific
- `CurricuLLM-NZ` — New Zealand curriculum

### 3. `run_id` in Usage
The `CompletionUsage` object includes a `run_id` field (UUID) for tracking and analytics. Not present in standard OpenAI API.

### 4. Educational Optimization
The entire API is described as "optimized for educational content generation and pedagogical applications" — meaning the models are fine-tuned for educational use cases.

---

## How EduLens Uses Each Feature

| CurricuLLM Feature | EduLens Usage |
|---------------------|--------------|
| `curriculum.stage` | Set from "Teaching To" selector → maps grade level to curriculum stage |
| `curriculum.subject` | Auto-detected by HyDE agent or set by user's subject filter |
| `model: CurricuLLM-AU` | Default model for all calls |
| `response_format: json_object` | Used by all pipeline calls (HyDE, Bad Cop, Good Cop, Synthesizer) |
| `temperature: 0.2-0.3` | Low temperature for consistent, factual educational responses |
| `stream: true` | Ready for use in Synthesize phase (not yet implemented) |
| `tools` / `function_calling` | Available but not currently used in pipeline |
| `run_id` | Can be used for analytics dashboard (not yet implemented) |
| System messages | Rich context-aware prompts with role, grade, localisation, and agent-specific instructions |

---

## Quick Reference — Making a Call with Python

```python
from openai import AsyncOpenAI

client = AsyncOpenAI(
    api_key="your-jwt-token",
    base_url="https://api.curricullm.com/v1",
)

# Standard call
response = await client.chat.completions.create(
    model="CurricuLLM-AU",
    messages=[
        {"role": "system", "content": "You are an educational content expert."},
        {"role": "user", "content": "Explain fractions for Year 3 students."},
    ],
    temperature=0.3,
    max_tokens=1024,
    curriculum={"stage": "Years 3 to 6", "subject": "Mathematics"},
)

print(response.choices[0].message.content)

# JSON mode call
response = await client.chat.completions.create(
    model="CurricuLLM-AU",
    messages=[...],
    response_format={"type": "json_object"},
    curriculum={"stage": "Years 7 to 9", "subject": "Science"},
)

import json
data = json.loads(response.choices[0].message.content)

# Streaming call
stream = await client.chat.completions.create(
    model="CurricuLLM-AU",
    messages=[...],
    stream=True,
    curriculum={"stage": "Years 10 to 12", "subject": "English"},
)

async for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
```
