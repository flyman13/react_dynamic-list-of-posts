import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { addComment } from '../api/comments';
import { Post } from '../types/Post';
import { Comment } from '../types/Comment';

interface NewCommentFormProps {
  selectedPost: Post;
  onAddComment: (comment: Comment) => void;
}

export const NewCommentForm: React.FC<NewCommentFormProps> = ({
  selectedPost,
  onAddComment,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [errors, setErrors] = useState({
    name: false,
    email: false,
    body: false,
  });

  const resetForm = () => {
    setName('');
    setEmail('');
    setBody('');
    setErrors({ name: false, email: false, body: false });
    setSubmitError('');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setErrors(prev => ({ ...prev, name: false }));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setErrors(prev => ({ ...prev, email: false }));
  };

  const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBody(e.target.value);
    setErrors(prev => ({ ...prev, body: false }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = {
      name: !name.trim(),
      email: !email.trim(),
      body: !body.trim(),
    };

    setErrors(newErrors);

    if (newErrors.name || newErrors.email || newErrors.body) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    addComment({
      postId: selectedPost.id,
      name,
      email,
      body,
    })
      .then(newComment => {
        onAddComment(newComment);
        setBody('');
      })
      .catch(() => setSubmitError('Unable to add a comment'))
      .finally(() => setIsSubmitting(false));
  };

  return (
    <form data-cy="NewCommentForm" onSubmit={handleSubmit}>
      {submitError && (
        <div className="notification is-danger" data-cy="ErrorMessage">
          {submitError}
        </div>
      )}

      <div className="field" data-cy="NameField">
        <label className="label" htmlFor="comment-author-name">
          Author Name
        </label>
        <div className="control has-icons-right">
          <input
            id="comment-author-name"
            data-cy="name"
            type="text"
            className={classNames('input', { 'is-danger': errors.name })}
            placeholder="Name"
            value={name}
            onChange={handleNameChange}
          />
          {errors.name && (
            <span className="icon is-small is-right" data-cy="ErrorIcon">
              <i className="fas fa-exclamation-triangle" />
            </span>
          )}
        </div>
        {errors.name && (
          <p className="help is-danger" data-cy="ErrorMessage">
            Name is required
          </p>
        )}
      </div>

      <div className="field" data-cy="EmailField">
        <label className="label" htmlFor="comment-author-email">
          Author Email
        </label>
        <div className="control has-icons-right">
          <input
            id="comment-author-email"
            data-cy="email"
            type="email"
            className={classNames('input', { 'is-danger': errors.email })}
            placeholder="Email"
            value={email}
            onChange={handleEmailChange}
          />
          {errors.email && (
            <span className="icon is-small is-right" data-cy="ErrorIcon">
              <i className="fas fa-exclamation-triangle" />
            </span>
          )}
        </div>
        {errors.email && (
          <p className="help is-danger" data-cy="ErrorMessage">
            Email is required
          </p>
        )}
      </div>

      <div className="field" data-cy="BodyField">
        <label className="label" htmlFor="comment-body">
          Comment
        </label>
        <div className="control">
          <textarea
            id="comment-body"
            data-cy="body"
            className={classNames('textarea', { 'is-danger': errors.body })}
            placeholder="Type comment here..."
            value={body}
            onChange={handleBodyChange}
          />
        </div>
        {errors.body && (
          <p className="help is-danger" data-cy="ErrorMessage">
            Comment is required
          </p>
        )}
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
            data-cy="ClearButton"
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
  }).isRequired,
  onAddComment: PropTypes.func.isRequired,
};
