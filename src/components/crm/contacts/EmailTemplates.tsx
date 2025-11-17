'use client';

import { useState } from 'react';
import { Copy, Check, Mail, Eye, User, Building2, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

interface Contact {
  name: string;
  position?: string;
  company_name?: string;
  email?: string;
}

interface EmailTemplatesProps {
  contact: Contact;
  jobTitle?: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  icon: any;
}

const TEMPLATES: EmailTemplate[] = [
  {
    id: 'initial',
    name: 'Initial Outreach',
    subject: 'Interested in {position} at {company}',
    body: `Hi {name},

I hope this email finds you well! I recently applied for the {position} role at {company} and wanted to reach out directly.

I'm particularly excited about this opportunity because [specific reason related to company/role]. With my background in [your relevant experience], I believe I could make a meaningful contribution to your team.

I'd love the chance to discuss how my skills align with what you're looking for. Would you be open to a brief conversation?

Thank you for your time and consideration.

Best regards,
[Your Name]`,
    icon: Mail,
  },
  {
    id: 'followup',
    name: 'Follow-up',
    subject: 'Following up on {position} application',
    body: `Hi {name},

I wanted to follow up on my application for the {position} role at {company} that I submitted on [date].

I remain very interested in this opportunity and would welcome the chance to discuss how I could contribute to your team. Is there any additional information I can provide to support my application?

Looking forward to hearing from you.

Best regards,
[Your Name]`,
    icon: User,
  },
  {
    id: 'thankyou',
    name: 'Thank You (Post-Interview)',
    subject: 'Thank you for the {position} interview',
    body: `Hi {name},

Thank you so much for taking the time to speak with me about the {position} role at {company}. I really enjoyed our conversation and learning more about the team and the exciting work you're doing.

I'm even more enthusiastic about the opportunity after our discussion, particularly [mention something specific from the interview]. I'm confident that my [relevant skills] would enable me to make a strong contribution.

Please don't hesitate to reach out if you need any additional information from me. I look forward to hearing about the next steps.

Best regards,
[Your Name]`,
    icon: Check,
  },
];

export function EmailTemplates({ contact, jobTitle }: EmailTemplatesProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate>(TEMPLATES[0]);
  const [showPreview, setShowPreview] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const replaceVariables = (text: string): string => {
    return text
      .replace(/{name}/g, contact.name.split(' ')[0] || contact.name)
      .replace(/{position}/g, jobTitle || contact.position || '[Position]')
      .replace(/{company}/g, contact.company_name || '[Company]');
  };

  const processedSubject = replaceVariables(selectedTemplate.subject);
  const processedBody = replaceVariables(selectedTemplate.body);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendEmail = () => {
    const mailto = `mailto:${contact.email || ''}?subject=${encodeURIComponent(
      processedSubject
    )}&body=${encodeURIComponent(processedBody)}`;
    window.location.href = mailto;
  };

  return (
    <div className="space-y-4">
      {/* Template Selector */}
      <div className="flex gap-2">
        {TEMPLATES.map((template) => {
          const Icon = template.icon;
          return (
            <button
              key={template.id}
              onClick={() => setSelectedTemplate(template)}
              className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                selectedTemplate.id === template.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Icon
                className={`h-5 w-5 mx-auto mb-1 ${
                  selectedTemplate.id === template.id ? 'text-blue-600' : 'text-gray-500'
                }`}
              />
              <p
                className={`text-sm font-medium ${
                  selectedTemplate.id === template.id ? 'text-blue-900' : 'text-gray-700'
                }`}
              >
                {template.name}
              </p>
            </button>
          );
        })}
      </div>

      {/* Template Content */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
        {/* Subject */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Subject</label>
            <button
              onClick={() => handleCopy(processedSubject, 'subject')}
              className="inline-flex items-center gap-1.5 px-2 py-1 text-xs text-gray-600 hover:text-gray-900 transition-colors"
            >
              {copiedId === 'subject' ? (
                <>
                  <Check className="h-3 w-3 text-green-600" />
                  <span className="text-green-600">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  Copy
                </>
              )}
            </button>
          </div>
          <div className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900">
            {processedSubject}
          </div>
        </div>

        {/* Body */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Message</label>
            <button
              onClick={() => handleCopy(processedBody, 'body')}
              className="inline-flex items-center gap-1.5 px-2 py-1 text-xs text-gray-600 hover:text-gray-900 transition-colors"
            >
              {copiedId === 'body' ? (
                <>
                  <Check className="h-3 w-3 text-green-600" />
                  <span className="text-green-600">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  Copy
                </>
              )}
            </button>
          </div>
          <div className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 whitespace-pre-wrap font-mono leading-relaxed max-h-64 overflow-y-auto">
            {processedBody}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleSendEmail}
          disabled={!contact.email}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Mail className="h-4 w-4" />
          {contact.email ? 'Open in Email Client' : 'No Email Available'}
        </button>
        <button
          onClick={() => handleCopy(`${processedSubject}\n\n${processedBody}`, 'all')}
          className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors inline-flex items-center gap-2"
        >
          {copiedId === 'all' ? (
            <>
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-green-600">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy All
            </>
          )}
        </button>
      </div>

      {/* Variable Helper */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs font-medium text-blue-900 mb-2">Available Variables:</p>
        <div className="flex flex-wrap gap-2">
          <code className="px-2 py-1 bg-white border border-blue-200 rounded text-xs text-blue-700">
            {'{name}'} → {contact.name.split(' ')[0]}
          </code>
          <code className="px-2 py-1 bg-white border border-blue-200 rounded text-xs text-blue-700">
            {'{position}'} → {jobTitle || contact.position || '[Position]'}
          </code>
          <code className="px-2 py-1 bg-white border border-blue-200 rounded text-xs text-blue-700">
            {'{company}'} → {contact.company_name || '[Company]'}
          </code>
        </div>
      </div>
    </div>
  );
}
