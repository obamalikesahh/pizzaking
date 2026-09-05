import React, { useEffect } from 'react';

const JivoChat = ({ widgetId = 'bgC1eSVdRL' }) => {
  useEffect(() => {
    const id = widgetId || localStorage.getItem('pk_jivo_id') || 'bgC1eSVdRL';
    if (!id) return;

    if (document.getElementById('jivo-chat-script')) return;

    const script = document.createElement('script');
    script.id = 'jivo-chat-script';
    script.src = `//code.jivosite.com/widget/${id}`;
    script.async = true;
    document.body.appendChild(script);
  }, [widgetId]);

  return null;
};

export default JivoChat;
