export const errorMessages: Record<string, string> = {
  PAYMENT_PENDING: "支付仍在处理中，请稍后重试查询。",
  PAYMENT_FAILED: "这次支付未完成，请重新发起支付。",
  GUIDANCE_NOT_RETRYABLE: "当前建议无需重试。",
  MEMBERSHIP_REQUIRED: "解锁完整评估后即可查看。",
  UNSUPPORTED_FLOW: "此测评版本暂不支持编辑，请开始新版测评。",
  ASSESSMENT_COMPLETED: "这份评估已完成，请开始新的测评。",
  ASSESSMENT_REQUIRED: "请先完成测评，再解锁完整评估。",
  IDEMPOTENCY_CONFLICT: "操作内容已改变，请载入最新进度后重试。",
  INCOMPLETE_ASSESSMENT: "还有问题未完成，请补齐后再提交。",
  INVALID_ANSWERS: "请检查输入范围和目标，再试一次。",
  INVALID_COMMAND_KEY: "操作标识无效，请刷新后重试。",
  INVALID_SOURCE: "无法读取来源测评，请开始新的测评。",
  NOT_FOUND: "找不到这份测评，请确认当前会话。",
  RESULT_NOT_FOUND: "结果尚未生成，请先完成测评。",
  SESSION_EXPIRED: "会话已过期，请重新连接。",
  SESSION_REQUIRED: "请先重新连接，再继续测评。",
  STEP_UNAVAILABLE: "请先完成前面的必要问题。",
  SUBSCRIPTION_INCONSISTENT: "暂时无法确认解锁状态，请重新连接。",
  UNSUPPORTED_ESTIMATE: "当前数据无法生成适用的估算，请检查体重与目标。",
  VERSION_CONFLICT: "另一个页面更新了这份测评，请载入最新进度。",
  VALIDATION_ERROR: "请检查输入格式和范围，再试一次。",
};
export const errorEnglish: Record<string, string> = {
  "支付仍在处理中，请稍后重试查询。":
    "Your payment is still processing. Please check again shortly.",
  "这次支付未完成，请重新发起支付。":
    "This payment did not complete. Please start a new payment.",
  "当前建议无需重试。": "These suggestions do not need to be regenerated.",
  "解锁完整评估后即可查看。": "Unlock your full assessment to view this.",
  "此测评版本暂不支持编辑，请开始新版测评。":
    "This assessment version cannot be edited. Please start a new one.",
  "这份评估已完成，请开始新的测评。":
    "This assessment is complete. Please start a new one.",
  "请先完成测评，再解锁完整评估。":
    "Complete your assessment before unlocking it.",
  "操作内容已改变，请载入最新进度后重试。":
    "The request has changed. Load your latest progress and try again.",
  "还有问题未完成，请补齐后再提交。":
    "Please answer the remaining questions before submitting.",
  "请检查输入范围和目标，再试一次。":
    "Check your measurements and target, then try again.",
  "操作标识无效，请刷新后重试。":
    "This request is no longer valid. Refresh and try again.",
  "无法读取来源测评，请开始新的测评。":
    "The original assessment is unavailable. Please start a new one.",
  "找不到这份测评，请确认当前会话。":
    "This assessment is unavailable in your current session.",
  "结果尚未生成，请先完成测评。":
    "Complete your assessment to generate your results.",
  "会话已过期，请重新连接。": "Your session has expired. Please reconnect.",
  "请先重新连接，再继续测评。":
    "Please reconnect before continuing your assessment.",
  "请先完成前面的必要问题。":
    "Complete the required questions before this step.",
  "暂时无法确认解锁状态，请重新连接。":
    "We couldn't confirm your access. Please reconnect.",
  "当前数据无法生成适用的估算，请检查体重与目标。":
    "An estimate isn't available for these measurements. Check your weight and target.",
  "另一个页面更新了这份测评，请载入最新进度。":
    "This assessment was updated in another tab. Load the latest progress.",
  "请检查输入格式和范围，再试一次。":
    "Check the format and range of your answers, then try again.",
};
