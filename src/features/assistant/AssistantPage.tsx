import { type FC, type FormEvent, type KeyboardEvent, useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp, faComments } from '@fortawesome/free-solid-svg-icons';
import { withSidebar } from '../../components/sidebar/withSideBar';
import { useAskMutation, useGetAssistantStatusQuery } from '../../services/assistant/assistantApi';
import { EXAMPLES, type Message, errorText, historyFor, toolsUsed } from './chat';
import styles from './AssistantPage.module.css';

const MAX_QUESTION = 500;

export const AssistantPage: FC = () => {
  const { data: status, isLoading: statusLoading } = useGetAssistantStatusQuery();
  const [ask, { isLoading: asking }] = useAskMutation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const nextId = useRef(1);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottom.current?.scrollIntoView?.({ block: 'end' });
  }, [messages, asking]);

  const send = async (text: string) => {
    const question = text.trim();
    if (!question || asking) return;
    const history = historyFor(messages);
    setMessages((m) => [...m, { id: nextId.current++, role: 'user', text: question }]);
    setDraft('');
    const result = await ask({ question, history });
    if ('data' in result && result.data) {
      const { answer, toolCalls } = result.data;
      setMessages((m) => [
        ...m,
        { id: nextId.current++, role: 'assistant', text: answer, toolCalls },
      ]);
    } else {
      const error = 'error' in result ? (result.error as { status?: number; data?: unknown }) : {};
      const message = (error.data as { error?: string } | undefined)?.error;
      setMessages((m) => [
        ...m,
        {
          id: nextId.current++,
          role: 'assistant',
          text: errorText(error.status, message),
          failed: true,
        },
      ]);
    }
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    void send(draft);
  };

  // Enter sends; Shift+Enter starts a new line.
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void send(draft);
    }
  };

  if (statusLoading) return null;

  return (
    // full-width-page (App.css): #root takes the page width, so the chat keeps
    // its size when the welcome is replaced by messages.
    <div className={`${styles.page} full-width-page`}>
      {!status?.enabled ? (
        <div className={styles.off} role="status">
          The assistant is turned off. To use it locally, set AI_ASSISTANT_ENABLED=true in the
          backend and run the AI service.
        </div>
      ) : (
        <>
          <div className={styles.chat}>
            {messages.length > 0 && (
              <div className={styles.toolbar}>
                <button type="button" className={styles.clear} onClick={() => setMessages([])}>
                  New conversation
                </button>
              </div>
            )}
            <div className={styles.messages} aria-live="polite">
              {messages.length === 0 && !asking && (
                <div className={styles.empty}>
                  <div className={styles.emptyIcon} aria-hidden="true">
                    <FontAwesomeIcon icon={faComments} />
                  </div>
                  <h2 className={styles.emptyTitle}>Ask about your spending</h2>
                  <p className={styles.emptyNote}>Try one of these, or write your own below.</p>
                  <div className={styles.examples}>
                    {EXAMPLES.map((example) => (
                      <button
                        key={example}
                        type="button"
                        className={styles.example}
                        onClick={() => void send(example)}
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`${styles.message} ${
                    message.failed ? styles.failed : styles[message.role]
                  }`}
                  data-role={message.role}
                >
                  {message.text}
                  {message.toolCalls && message.toolCalls.length > 0 && (
                    <div className={styles.tools}>
                      Looked at: {toolsUsed(message.toolCalls).join(', ')}
                    </div>
                  )}
                </div>
              ))}
              {asking && (
                <div className={styles.thinking} role="status" aria-label="Thinking">
                  <span />
                  <span />
                  <span />
                </div>
              )}
              <div ref={bottom} />
            </div>

            <form className={styles.composer} onSubmit={onSubmit}>
              <textarea
                aria-label="Your question"
                placeholder="Ask about your spending…"
                value={draft}
                maxLength={MAX_QUESTION}
                rows={1}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={onKeyDown}
              />
              <button
                type="submit"
                className={styles.send}
                aria-label="Send"
                disabled={!draft.trim() || asking}
              >
                <FontAwesomeIcon icon={faArrowUp} />
              </button>
            </form>
          </div>
          <p className={styles.hint}>
            Answers come from your own expenses. It only looks things up and never makes changes.
          </p>
        </>
      )}
    </div>
  );
};

const AssistantPageWithSidebar = withSidebar()(AssistantPage);
export default AssistantPageWithSidebar;
