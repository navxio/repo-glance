import React from 'react';

const DefaultPage: React.FC = () => {

  return (
    <div style={{ width: '200px', height: 'auto' }}>
      <label>Enabled</label>
      <input name='enabled_on_page' type='checkbox' />
    </div>
  )

}

export default DefaultPage
