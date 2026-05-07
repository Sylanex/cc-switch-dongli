/**
 * OpenClaw provider presets configuration
 * OpenClaw uses models.providers structure with custom provider configs
 */
import type {
  ProviderCategory,
  OpenClawProviderConfig,
  OpenClawDefaultModel,
} from "../types";
import type { PresetTheme, TemplateValueConfig } from "./claudeProviderPresets";

/** Suggested default model configuration for a preset */
export interface OpenClawSuggestedDefaults {
  /** Default model config to apply (agents.defaults.model) */
  model?: OpenClawDefaultModel;
  /** Model catalog entries to add (agents.defaults.models) */
  modelCatalog?: Record<string, { alias?: string }>;
}

export interface OpenClawProviderPreset {
  name: string;
  nameKey?: string; // i18n key for localized display name
  websiteUrl: string;
  apiKeyUrl?: string;
  /** OpenClaw settings_config structure */
  settingsConfig: OpenClawProviderConfig;
  isOfficial?: boolean;
  isPartner?: boolean;
  partnerPromotionKey?: string;
  category?: ProviderCategory;
  /** Template variable definitions */
  templateValues?: Record<string, TemplateValueConfig>;
  /** Visual theme config */
  theme?: PresetTheme;
  /** Icon name */
  icon?: string;
  /** Icon color */
  iconColor?: string;
  /** Mark as custom template (for UI distinction) */
  isCustomTemplate?: boolean;
  /** Suggested default model configuration */
  suggestedDefaults?: OpenClawSuggestedDefaults;
}

/**
 * OpenClaw API protocol options
 * @see https://github.com/openclaw/openclaw/blob/main/docs/gateway/configuration.md
 */
export const openclawApiProtocols = [
  { value: "openai-completions", label: "OpenAI Completions" },
  { value: "openai-responses", label: "OpenAI Responses" },
  { value: "anthropic-messages", label: "Anthropic Messages" },
  { value: "google-generative-ai", label: "Google Generative AI" },
  { value: "bedrock-converse-stream", label: "AWS Bedrock" },
] as const;

/**
 * OpenClaw provider presets list
 */
export const openclawProviderPresets: OpenClawProviderPreset[] = [
  {
    name: "DeepSeek",
    websiteUrl: "https://platform.deepseek.com",
    apiKeyUrl: "https://platform.deepseek.com/api_keys",
    settingsConfig: {
      baseUrl: "https://api.deepseek.com/v1",
      apiKey: "",
      api: "openai-completions",
      models: [
        {
          id: "deepseek-v4-pro",
          name: "DeepSeek V4 Pro",
          contextWindow: 1000000,
          cost: { input: 1.68, output: 3.36 },
        },
        {
          id: "deepseek-v4-flash",
          name: "DeepSeek V4 Flash",
          contextWindow: 1000000,
          cost: { input: 0.14, output: 0.28 },
        },
      ],
    },
    category: "cn_official",
    icon: "deepseek",
    iconColor: "#1E88E5",
    templateValues: {
      apiKey: {
        label: "API Key",
        placeholder: "sk-...",
        editorValue: "",
      },
    },
    suggestedDefaults: {
      model: {
        primary: "deepseek/deepseek-v4-flash",
        fallbacks: ["deepseek/deepseek-v4-pro"],
      },
      modelCatalog: {
        "deepseek/deepseek-v4-flash": { alias: "Flash" },
        "deepseek/deepseek-v4-pro": { alias: "Pro" },
      },
    },
  },
  {
    name: "Zhipu GLM",
    websiteUrl: "https://open.bigmodel.cn",
    apiKeyUrl: "https://www.bigmodel.cn/claude-code?ic=RRVJPB5SII",
    settingsConfig: {
      baseUrl: "https://open.bigmodel.cn/api/paas/v4",
      apiKey: "",
      api: "openai-completions",
      models: [
        {
          id: "glm-5",
          name: "GLM-5",
          contextWindow: 128000,
          cost: { input: 0.001, output: 0.001 },
        },
      ],
    },
    category: "cn_official",
    icon: "zhipu",
    iconColor: "#0F62FE",
    templateValues: {
      baseUrl: {
        label: "Base URL",
        placeholder: "https://open.bigmodel.cn/api/paas/v4",
        defaultValue: "https://open.bigmodel.cn/api/paas/v4",
        editorValue: "",
      },
      apiKey: {
        label: "API Key",
        placeholder: "",
        editorValue: "",
      },
    },
    suggestedDefaults: {
      model: { primary: "zhipu/glm-5" },
      modelCatalog: { "zhipu/glm-5": { alias: "GLM" } },
    },
  },
  {
    name: "Zhipu GLM en",
    websiteUrl: "https://z.ai",
    apiKeyUrl: "https://z.ai/subscribe?ic=8JVLJQFSKB",
    settingsConfig: {
      baseUrl: "https://api.z.ai/v1",
      apiKey: "",
      api: "openai-completions",
      models: [
        {
          id: "glm-5",
          name: "GLM-5",
          contextWindow: 128000,
          cost: { input: 0.001, output: 0.001 },
        },
      ],
    },
    category: "cn_official",
    icon: "zhipu",
    iconColor: "#0F62FE",
    templateValues: {
      baseUrl: {
        label: "Base URL",
        placeholder: "https://api.z.ai/v1",
        defaultValue: "https://api.z.ai/v1",
        editorValue: "",
      },
      apiKey: {
        label: "API Key",
        placeholder: "",
        editorValue: "",
      },
    },
    suggestedDefaults: {
      model: { primary: "zhipu-en/glm-5" },
      modelCatalog: { "zhipu-en/glm-5": { alias: "GLM" } },
    },
  },
  {
    name: "Qwen Coder",
    websiteUrl: "https://bailian.console.aliyun.com",
    apiKeyUrl: "https://bailian.console.aliyun.com/#/api-key",
    settingsConfig: {
      baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
      apiKey: "",
      api: "openai-completions",
      models: [
        {
          id: "qwen3.5-plus",
          name: "Qwen3.5 Plus",
          contextWindow: 32000,
          cost: { input: 0.002, output: 0.006 },
        },
      ],
    },
    category: "cn_official",
    icon: "qwen",
    iconColor: "#FF6A00",
    templateValues: {
      baseUrl: {
        label: "Base URL",
        placeholder: "https://dashscope.aliyuncs.com/compatible-mode/v1",
        defaultValue: "https://dashscope.aliyuncs.com/compatible-mode/v1",
        editorValue: "",
      },
      apiKey: {
        label: "API Key",
        placeholder: "sk-...",
        editorValue: "",
      },
    },
    suggestedDefaults: {
      model: { primary: "qwen/qwen3.5-plus" },
      modelCatalog: { "qwen/qwen3.5-plus": { alias: "Qwen" } },
    },
  },
  {
    name: "Kimi k2.6",
    websiteUrl: "https://platform.moonshot.cn/console",
    apiKeyUrl: "https://platform.moonshot.cn/console/api-keys",
    settingsConfig: {
      baseUrl: "https://api.moonshot.cn/v1",
      apiKey: "",
      api: "openai-completions",
      models: [
        {
          id: "kimi-k2.6",
          name: "Kimi K2.6",
          contextWindow: 131072,
          cost: { input: 0.002, output: 0.006 },
        },
      ],
    },
    category: "cn_official",
    icon: "kimi",
    iconColor: "#6366F1",
    templateValues: {
      baseUrl: {
        label: "Base URL",
        placeholder: "https://api.moonshot.cn/v1",
        defaultValue: "https://api.moonshot.cn/v1",
        editorValue: "",
      },
      apiKey: {
        label: "API Key",
        placeholder: "sk-...",
        editorValue: "",
      },
    },
    suggestedDefaults: {
      model: { primary: "kimi/kimi-k2.6" },
      modelCatalog: { "kimi/kimi-k2.6": { alias: "Kimi" } },
    },
  },
  {
    name: "Kimi For Coding",
    websiteUrl: "https://www.kimi.com/code/docs/",
    apiKeyUrl: "https://platform.moonshot.cn/console/api-keys",
    settingsConfig: {
      baseUrl: "https://api.kimi.com/v1",
      apiKey: "",
      api: "openai-completions",
      models: [
        {
          id: "kimi-for-coding",
          name: "Kimi For Coding",
          contextWindow: 131072,
          cost: { input: 0.002, output: 0.006 },
        },
      ],
    },
    category: "cn_official",
    icon: "kimi",
    iconColor: "#6366F1",
    templateValues: {
      baseUrl: {
        label: "Base URL",
        placeholder: "https://api.kimi.com/v1",
        defaultValue: "https://api.kimi.com/v1",
        editorValue: "",
      },
      apiKey: {
        label: "API Key",
        placeholder: "sk-...",
        editorValue: "",
      },
    },
    suggestedDefaults: {
      model: { primary: "kimi-coding/kimi-for-coding" },
      modelCatalog: { "kimi-coding/kimi-for-coding": { alias: "Kimi" } },
    },
  },
  {
    name: "StepFun",
    websiteUrl: "https://platform.stepfun.com/step-plan",
    apiKeyUrl: "https://platform.stepfun.com/interface-key",
    settingsConfig: {
      baseUrl: "https://api.stepfun.com/step_plan/v1",
      apiKey: "",
      api: "openai-completions",
      models: [
        {
          id: "step-3.5-flash-2603",
          name: "Step 3.5 Flash 2603",
          contextWindow: 262144,
        },
        {
          id: "step-3.5-flash",
          name: "Step 3.5 Flash",
          contextWindow: 262144,
        },
      ],
    },
    category: "cn_official",
    icon: "stepfun",
    iconColor: "#16D6D2",
    templateValues: {
      baseUrl: {
        label: "Base URL",
        placeholder: "https://api.stepfun.com/step_plan/v1",
        defaultValue: "https://api.stepfun.com/step_plan/v1",
        editorValue: "",
      },
      apiKey: {
        label: "API Key",
        placeholder: "step-...",
        editorValue: "",
      },
    },
    suggestedDefaults: {
      model: { primary: "stepfun/step-3.5-flash-2603" },
      modelCatalog: {
        "stepfun/step-3.5-flash-2603": { alias: "StepFun" },
        "stepfun/step-3.5-flash": { alias: "StepFun Flash" },
      },
    },
  },
  {
    name: "StepFun en",
    websiteUrl: "https://platform.stepfun.ai/step-plan",
    apiKeyUrl: "https://platform.stepfun.ai/interface-key",
    settingsConfig: {
      baseUrl: "https://api.stepfun.ai/step_plan/v1",
      apiKey: "",
      api: "openai-completions",
      models: [
        {
          id: "step-3.5-flash-2603",
          name: "Step 3.5 Flash 2603",
          contextWindow: 262144,
        },
        {
          id: "step-3.5-flash",
          name: "Step 3.5 Flash",
          contextWindow: 262144,
        },
      ],
    },
    category: "cn_official",
    icon: "stepfun",
    iconColor: "#16D6D2",
    templateValues: {
      baseUrl: {
        label: "Base URL",
        placeholder: "https://api.stepfun.ai/step_plan/v1",
        defaultValue: "https://api.stepfun.ai/step_plan/v1",
        editorValue: "",
      },
      apiKey: {
        label: "API Key",
        placeholder: "step-...",
        editorValue: "",
      },
    },
    suggestedDefaults: {
      model: { primary: "stepfun-en/step-3.5-flash-2603" },
      modelCatalog: {
        "stepfun-en/step-3.5-flash-2603": { alias: "StepFun" },
        "stepfun-en/step-3.5-flash": { alias: "StepFun Flash" },
      },
    },
  },
  {
    name: "KAT-Coder",
    websiteUrl: "https://console.streamlake.ai",
    apiKeyUrl: "https://console.streamlake.ai/console/api-key",
    settingsConfig: {
      baseUrl:
        "https://vanchin.streamlake.ai/api/gateway/v1/endpoints/${ENDPOINT_ID}/openai",
      apiKey: "",
      api: "openai-completions",
      models: [
        {
          id: "KAT-Coder-Pro",
          name: "KAT-Coder Pro",
          contextWindow: 128000,
          cost: { input: 0.002, output: 0.006 },
        },
      ],
    },
    category: "cn_official",
    icon: "catcoder",
    templateValues: {
      baseUrl: {
        label: "Base URL",
        placeholder:
          "https://vanchin.streamlake.ai/api/gateway/v1/endpoints/${ENDPOINT_ID}/openai",
        defaultValue:
          "https://vanchin.streamlake.ai/api/gateway/v1/endpoints/${ENDPOINT_ID}/openai",
        editorValue: "",
      },
      ENDPOINT_ID: {
        label: "Endpoint ID",
        placeholder: "",
        editorValue: "",
      },
      apiKey: {
        label: "API Key",
        placeholder: "",
        editorValue: "",
      },
    },
    suggestedDefaults: {
      model: { primary: "katcoder/KAT-Coder-Pro" },
      modelCatalog: { "katcoder/KAT-Coder-Pro": { alias: "KAT-Coder" } },
    },
  },
  {
    name: "Longcat",
    websiteUrl: "https://longcat.chat/platform",
    apiKeyUrl: "https://longcat.chat/platform/api_keys",
    settingsConfig: {
      baseUrl: "https://api.longcat.chat/v1",
      apiKey: "",
      api: "openai-completions",
      authHeader: true,
      models: [
        {
          id: "LongCat-Flash-Chat",
          name: "LongCat Flash Chat",
          contextWindow: 128000,
          cost: { input: 0.001, output: 0.004 },
        },
      ],
    },
    category: "cn_official",
    icon: "longcat",
    iconColor: "#29E154",
    templateValues: {
      baseUrl: {
        label: "Base URL",
        placeholder: "https://api.longcat.chat/v1",
        defaultValue: "https://api.longcat.chat/v1",
        editorValue: "",
      },
      apiKey: {
        label: "API Key",
        placeholder: "",
        editorValue: "",
      },
    },
    suggestedDefaults: {
      model: { primary: "longcat/LongCat-Flash-Chat" },
      modelCatalog: { "longcat/LongCat-Flash-Chat": { alias: "LongCat" } },
    },
  },
  {
    name: "DouBaoSeed",
    websiteUrl: "https://www.volcengine.com/product/doubao",
    apiKeyUrl: "https://www.volcengine.com/product/doubao",
    settingsConfig: {
      baseUrl: "https://ark.cn-beijing.volces.com/api/v3",
      apiKey: "",
      api: "openai-completions",
      models: [
        {
          id: "doubao-seed-2-0-code-preview-latest",
          name: "DouBao Seed Code Preview",
          contextWindow: 128000,
          cost: { input: 0.002, output: 0.006 },
        },
      ],
    },
    category: "cn_official",
    icon: "doubao",
    iconColor: "#3370FF",
    templateValues: {
      apiKey: {
        label: "API Key",
        placeholder: "",
        editorValue: "",
      },
    },
    suggestedDefaults: {
      model: { primary: "doubaoseed/doubao-seed-2-0-code-preview-latest" },
      modelCatalog: {
        "doubaoseed/doubao-seed-2-0-code-preview-latest": { alias: "DouBao" },
      },
    },
  },
  {
    name: "BaiLing",
    websiteUrl: "https://alipaytbox.yuque.com/sxs0ba/ling/get_started",
    settingsConfig: {
      baseUrl: "https://api.tbox.cn/v1",
      apiKey: "",
      api: "openai-completions",
      models: [
        {
          id: "Ling-2.5-1T",
          name: "Ling 2.5 1T",
          contextWindow: 128000,
          cost: { input: 0.001, output: 0.004 },
        },
      ],
    },
    category: "cn_official",
    templateValues: {
      apiKey: {
        label: "API Key",
        placeholder: "",
        editorValue: "",
      },
    },
    suggestedDefaults: {
      model: { primary: "bailing/Ling-2.5-1T" },
      modelCatalog: { "bailing/Ling-2.5-1T": { alias: "BaiLing" } },
    },
  },
  {
    name: "Xiaomi MiMo",
    websiteUrl: "https://platform.xiaomimimo.com",
    apiKeyUrl: "https://platform.xiaomimimo.com/#/console/api-keys",
    settingsConfig: {
      baseUrl: "https://api.xiaomimimo.com/v1",
      apiKey: "",
      api: "openai-completions",
      models: [
        {
          id: "mimo-v2-pro",
          name: "MiMo V2 Pro",
          contextWindow: 128000,
          cost: { input: 0.001, output: 0.004 },
        },
      ],
    },
    category: "cn_official",
    icon: "xiaomimimo",
    iconColor: "#000000",
    templateValues: {
      apiKey: {
        label: "API Key",
        placeholder: "",
        editorValue: "",
      },
    },
    suggestedDefaults: {
      model: { primary: "xiaomimimo/mimo-v2-pro" },
      modelCatalog: { "xiaomimimo/mimo-v2-pro": { alias: "MiMo" } },
    },
  },
  {
    name: "AiHubMix",
    websiteUrl: "https://aihubmix.com",
    apiKeyUrl: "https://aihubmix.com",
    settingsConfig: {
      baseUrl: "https://aihubmix.com",
      apiKey: "",
      api: "anthropic-messages",
      models: [
        {
          id: "claude-opus-4-7",
          name: "Claude Opus 4.7",
          contextWindow: 1000000,
          cost: { input: 5, output: 25 },
        },
        {
          id: "claude-sonnet-4-6",
          name: "Claude Sonnet 4.6",
          contextWindow: 1000000,
          cost: { input: 3, output: 15 },
        },
      ],
    },
    category: "aggregator",
    icon: "aihubmix",
    iconColor: "#006FFB",
    templateValues: {
      apiKey: {
        label: "API Key",
        placeholder: "",
        editorValue: "",
      },
    },
    suggestedDefaults: {
      model: {
        primary: "aihubmix/claude-opus-4-7",
        fallbacks: ["aihubmix/claude-sonnet-4-6"],
      },
      modelCatalog: {
        "aihubmix/claude-opus-4-7": { alias: "Opus" },
        "aihubmix/claude-sonnet-4-6": { alias: "Sonnet" },
      },
    },
  },
  {
    name: "OpenRouter",
    websiteUrl: "https://openrouter.ai",
    apiKeyUrl: "https://openrouter.ai/keys",
    settingsConfig: {
      baseUrl: "https://openrouter.ai/api/v1",
      apiKey: "",
      api: "openai-completions",
      models: [
        {
          id: "anthropic/claude-opus-4.7",
          name: "Claude Opus 4.7",
          contextWindow: 1000000,
          cost: { input: 5, output: 25 },
        },
        {
          id: "anthropic/claude-sonnet-4.6",
          name: "Claude Sonnet 4.6",
          contextWindow: 1000000,
          cost: { input: 3, output: 15 },
        },
      ],
    },
    category: "aggregator",
    icon: "openrouter",
    iconColor: "#6566F1",
    templateValues: {
      apiKey: {
        label: "API Key",
        placeholder: "sk-or-...",
        editorValue: "",
      },
    },
    suggestedDefaults: {
      model: {
        primary: "openrouter/anthropic/claude-opus-4.7",
        fallbacks: ["openrouter/anthropic/claude-sonnet-4.6"],
      },
      modelCatalog: {
        "openrouter/anthropic/claude-opus-4.7": { alias: "Opus" },
        "openrouter/anthropic/claude-sonnet-4.6": { alias: "Sonnet" },
      },
    },
  },
  {
    name: "TheRouter",
    websiteUrl: "https://therouter.ai",
    apiKeyUrl: "https://dashboard.therouter.ai",
    settingsConfig: {
      baseUrl: "https://api.therouter.ai/v1",
      apiKey: "",
      api: "openai-completions",
      models: [
        {
          id: "anthropic/claude-sonnet-4.6",
          name: "Claude Sonnet 4.6",
          contextWindow: 1000000,
          cost: { input: 3, output: 15, cacheRead: 0.3, cacheWrite: 3.75 },
        },
        {
          id: "openai/gpt-5.3-codex",
          name: "GPT-5.3 Codex",
          contextWindow: 400000,
          cost: { input: 5, output: 40, cacheRead: 0.5 },
        },
        {
          id: "openai/gpt-5.2",
          name: "GPT-5.2",
          contextWindow: 400000,
          cost: { input: 1.75, output: 14, cacheRead: 0.175 },
        },
        {
          id: "google/gemini-3-flash-preview",
          name: "Gemini 3 Flash Preview",
          contextWindow: 1000000,
          cost: { input: 0.5, output: 3, cacheRead: 0.05 },
        },
        {
          id: "qwen/qwen3-coder-480b",
          name: "Qwen3 Coder 480B",
          contextWindow: 262144,
          cost: { input: 0.6, output: 2.35 },
        },
      ],
    },
    category: "aggregator",
    templateValues: {
      apiKey: {
        label: "API Key",
        placeholder: "sk-...",
        editorValue: "",
      },
    },
    suggestedDefaults: {
      model: {
        primary: "therouter/anthropic/claude-sonnet-4.6",
        fallbacks: [
          "therouter/openai/gpt-5.2",
          "therouter/google/gemini-3-flash-preview",
        ],
      },
      modelCatalog: {
        "therouter/anthropic/claude-sonnet-4.6": { alias: "Sonnet" },
        "therouter/openai/gpt-5.2": { alias: "GPT-5.2" },
        "therouter/google/gemini-3-flash-preview": { alias: "Gemini Flash" },
        "therouter/openai/gpt-5.3-codex": { alias: "Codex" },
        "therouter/qwen/qwen3-coder-480b": { alias: "Qwen Coder" },
      },
    },
  },
  {
    name: "ModelScope",
    websiteUrl: "https://modelscope.cn",
    apiKeyUrl: "https://modelscope.cn/my/myaccesstoken",
    settingsConfig: {
      baseUrl: "https://api-inference.modelscope.cn/v1",
      apiKey: "",
      api: "openai-completions",
      models: [
        {
          id: "ZhipuAI/GLM-5",
          name: "GLM-5",
          contextWindow: 128000,
          cost: { input: 0.001, output: 0.001 },
        },
      ],
    },
    category: "aggregator",
    icon: "modelscope",
    iconColor: "#624AFF",
    templateValues: {
      baseUrl: {
        label: "Base URL",
        placeholder: "https://api-inference.modelscope.cn/v1",
        defaultValue: "https://api-inference.modelscope.cn/v1",
        editorValue: "",
      },
      apiKey: {
        label: "API Key",
        placeholder: "",
        editorValue: "",
      },
    },
    suggestedDefaults: {
      model: { primary: "modelscope/ZhipuAI/GLM-5" },
      modelCatalog: { "modelscope/ZhipuAI/GLM-5": { alias: "GLM" } },
    },
  },
  {
    name: "Novita AI",
    websiteUrl: "https://novita.ai",
    apiKeyUrl: "https://novita.ai",
    settingsConfig: {
      baseUrl: "https://api.novita.ai/openai",
      apiKey: "",
      api: "openai-completions",
      models: [
        {
          id: "zai-org/glm-5",
          name: "GLM-5",
          contextWindow: 202800,
          cost: { input: 1, output: 3.2, cacheRead: 0.2 },
        },
      ],
    },
    category: "aggregator",
    icon: "novita",
    iconColor: "#000000",
    templateValues: {
      apiKey: {
        label: "API Key",
        placeholder: "sk-...",
        editorValue: "",
      },
    },
    suggestedDefaults: {
      model: { primary: "novita/zai-org/glm-5" },
      modelCatalog: {
        "novita/zai-org/glm-5": { alias: "GLM-5" },
      },
    },
  },
  {
    name: "Nvidia",
    websiteUrl: "https://build.nvidia.com",
    apiKeyUrl: "https://build.nvidia.com/settings/api-keys",
    settingsConfig: {
      baseUrl: "https://integrate.api.nvidia.com/v1",
      apiKey: "",
      api: "openai-completions",
      models: [
        {
          id: "moonshotai/kimi-k2.5",
          name: "Kimi K2.5",
          contextWindow: 131072,
          cost: { input: 0.002, output: 0.006 },
        },
      ],
    },
    category: "aggregator",
    icon: "nvidia",
    iconColor: "#000000",
    templateValues: {
      apiKey: {
        label: "API Key",
        placeholder: "nvapi-...",
        editorValue: "",
      },
    },
    suggestedDefaults: {
      model: { primary: "nvidia/moonshotai/kimi-k2.5" },
      modelCatalog: { "nvidia/moonshotai/kimi-k2.5": { alias: "Kimi" } },
    },
  },
  {
    name: "PIPELLM",
    websiteUrl: "https://code.pipellm.ai",
    apiKeyUrl: "https://code.pipellm.ai/login?ref=uvw650za",
    settingsConfig: {
      baseUrl: "https://cc-api.pipellm.ai",
      apiKey: "",
      api: "anthropic-messages",
      models: [
        {
          id: "claude-opus-4-7",
          name: "claude-opus-4-7",
          contextWindow: 1000000,
          cost: { input: 5, output: 25 },
        },
        {
          id: "claude-sonnet-4-6",
          name: "claude-sonnet-4-6",
          contextWindow: 1000000,
          cost: { input: 3, output: 15 },
        },
        {
          id: "claude-haiku-4-5-20251001",
          name: "claude-haiku-4-5-20251001",
          contextWindow: 200000,
          cost: { input: 0.8, output: 4 },
        },
      ],
    },
    category: "aggregator",
    icon: "pipellm",
    templateValues: {
      apiKey: {
        label: "API Key",
        placeholder: "pipe-...",
        editorValue: "",
      },
    },
    suggestedDefaults: {
      model: {
        primary: "pipellm/claude-opus-4-7",
        fallbacks: ["pipellm/claude-sonnet-4-6"],
      },
      modelCatalog: {
        "pipellm/claude-opus-4-7": { alias: "Opus" },
        "pipellm/claude-sonnet-4-6": { alias: "Sonnet" },
        "pipellm/claude-haiku-4-5-20251001": { alias: "Haiku" },
      },
    },
  },
  {
    name: "E-FlowCode",
    websiteUrl: "https://e-flowcode.cc",
    apiKeyUrl: "https://e-flowcode.cc",
    settingsConfig: {
      api: "openai-responses",
      apiKey: "",
      baseUrl: "https://e-flowcode.cc/v1",
      headers: {
        "User-Agent":
          "codex_cli_rs/0.77.0 (Windows 10.0.26100; x86_64) WindowsTerminal",
      },
      models: [
        {
          contextWindow: 200000,
          cost: {
            cacheRead: 0,
            cacheWrite: 0,
            input: 0,
            output: 0,
          },
          id: "gpt-5.3-codex",
          maxTokens: 32000,
          name: "gpt-5.3-codex",
        },
        {
          id: "gpt-5.4",
          name: "gpt-5.4",
        },
        {
          id: "gpt-5.2-codex",
          name: "gpt-5.2-codex",
        },
        {
          id: "gpt-5.2",
          name: "gpt-5.2",
        },
      ],
    },
    category: "third_party",
    icon: "eflowcode",
    iconColor: "#000000",
    templateValues: {
      apiKey: {
        label: "API Key",
        placeholder: "sk-...",
        editorValue: "",
      },
    },
    suggestedDefaults: {
      model: {
        primary: "eflowcode/gpt-5.3-codex",
        fallbacks: ["eflowcode/gpt-5.4", "eflowcode/gpt-5.2-codex"],
      },
      modelCatalog: {
        "eflowcode/gpt-5.3-codex": { alias: "gpt-5.3-codex" },
        "eflowcode/gpt-5.4": { alias: "gpt-5.4" },
        "eflowcode/gpt-5.2-codex": { alias: "gpt-5.2-codex" },
        "eflowcode/gpt-5.2": { alias: "gpt-5.2" },
      },
    },
  },
  {
    name: "AWS Bedrock",
    websiteUrl: "https://aws.amazon.com/bedrock/",
    settingsConfig: {
      // 请将 us-west-2 替换为你的 AWS Region
      baseUrl: "https://bedrock-runtime.us-west-2.amazonaws.com",
      apiKey: "",
      api: "bedrock-converse-stream",
      models: [
        {
          id: "anthropic.claude-opus-4-7",
          name: "Claude Opus 4.7",
          contextWindow: 1000000,
          cost: { input: 5, output: 25, cacheRead: 0.5, cacheWrite: 6.25 },
        },
        {
          id: "anthropic.claude-sonnet-4-6",
          name: "Claude Sonnet 4.6",
          contextWindow: 1000000,
          cost: { input: 3, output: 15, cacheRead: 0.3, cacheWrite: 3.75 },
        },
        {
          id: "anthropic.claude-haiku-4-5-20251022-v1:0",
          name: "Claude Haiku 4.5",
          contextWindow: 200000,
          cost: { input: 0.8, output: 4, cacheRead: 0.08, cacheWrite: 1 },
        },
      ],
    },
    category: "cloud_provider",
    icon: "aws",
    iconColor: "#FF9900",
  },
  {
    name: "OpenAI Compatible",
    websiteUrl: "",
    settingsConfig: {
      baseUrl: "",
      apiKey: "",
      api: "openai-completions",
      models: [],
    },
    category: "custom",
    isCustomTemplate: true,
    icon: "generic",
    iconColor: "#6B7280",
    templateValues: {
      baseUrl: {
        label: "Base URL",
        placeholder: "https://api.example.com/v1",
        editorValue: "",
      },
      apiKey: {
        label: "API Key",
        placeholder: "",
        editorValue: "",
      },
    },
  },
];
