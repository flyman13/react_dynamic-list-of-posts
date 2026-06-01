import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { addComment } from '../api/comments';
import { Post } from '../types/Post';
import { Comment } from '../types/Comment';

interface Prop {
  selectedPost: Post | null;
  setIsLoading: (value: boolean) => void;
  setErrorMessage: (errorMessage: string) => void;
  setOpenCommentForm: (value: boolean) => void;
  onAddComment: (comment: Comment) => void;
}

export const NewCommentForm: React.FC<Prop> = ({
  selectedPost,
  setIsLoading,
  setErrorMessage,
  setOpenCommentForm,
  onAddComment,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [body, setBody] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({
    name: false,
    email: false,
    body: false,
  });

  const resetForm = () => {
    setName('');
    setEmail('');
    setBody('');
    setErrors({
      name: false,
      email: false,
      body: false,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = {
      name: !name.trim(),
      email: !email.trim(),
      body: !body.trim(),
    };

    setErrors(newErrors);

    if (newErrors.name || newErrors.email || newErrors.body || !selectedPost) {
      return;
    }

    setIsSubmitting(true);
    setIsLoading(true);

    addComment({
      postId: selectedPost.id,
      name,
      email,
      body,
    })
      .then(newComment => {
        onAddComment(newComment);
        setBody(''); // Очищаємо тільки коментар за ТЗ, ім'я та email лишаються
        setOpenCommentForm(false);
      })
      .catch(() => setErrorMessage('Unable to add a comment'))
      .finally(() => {
        setIsSubmitting(false);
        setIsLoading(false);
      });
  };

  return (
    <form data-cy="NewCommentForm" onSubmit={handleSubmit}>
      <div className="field">
        <label className="label" htmlFor="comment-author-name">
          Author Name
        </label>
        <div className="control">
          <input
            id="comment-author-name"
            type="text"
            className={classNames('input', { 'is-danger': errors.name })}
            placeholder="Name"
            value={name}
            onChange={e => {
              setName(e.target.value);
              setErrors(prev => ({ ...prev, name: false }));
            }}
          />
        </div>
      </div>

      <div className="field">
        <label className="label" htmlFor="comment-author-email">
          Author Email
        </label>
        <div className="control">
          <input
            id="comment-author-email"
            type="email"
            className={classNames('input', { 'is-danger': errors.email })}
            placeholder="Email"
            value={email}
            onChange={e => {
              setEmail(e.target.value);
              setErrors(prev => ({ ...prev, email: false }));
            }}
          />
        </div>
      </div>

      <div className="field">
        <label className="label" htmlFor="comment-body">
          Comment
        </label>
        <div className="control">
          <textarea
            id="comment-body"
            className={classNames('textarea', { 'is-danger': errors.body })}
            placeholder="Type comment here..."
            value={body}
            onChange={e => {
              setBody(e.target.value);
              setErrors(prev => ({ ...prev, body: false }));
            }}
          />
        </div>
      </div>

      <div className="field is-grouped">
        <div className="control">
          <button
            type="submit"
            className={classNames('button', 'is-link', {
              'is-loading': isSubmitting,
            })}
          >
            Add Comment
          </button>
        </div>
        <div className="control">
          <button
            type="button"
            className="button is-link is-light"
            onClick={resetForm}
          >
            Clear
          </button>
        </div>
      </div>
    </form>
  );
};

NewCommentForm.propTypes = {
  selectedPost: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    body: PropTypes.string.isRequired,
    userId: PropTypes.number.isRequired,
  }),
  setIsLoading: PropTypes.func.isRequired,
  setErrorMessage: PropTypes.func.isRequired,
  setOpenCommentForm: PropTypes.func.isRequired,
  onAddComment: PropTypes.func.isRequired,
};
