<?php

use dokuwiki\Extension\SyntaxPlugin;

/**
 * DokuWiki Plugin wiwien (Syntax Component)
 *
 * @license GPL 2 http://www.gnu.org/licenses/gpl-2.0.html
 * @author Andreas Gohr <gohr@cosmocode.de>
 */
class syntax_plugin_wiwien_slider extends SyntaxPlugin
{
    /** @inheritDoc */
    public function getType()
    {
        return 'substition';
    }

    /** @inheritDoc */
    public function getPType()
    {
        return 'block';
    }

    /** @inheritDoc */
    public function getSort()
    {
        return 133;
    }

    /** @inheritDoc */
    public function connectTo($mode)
    {
        $this->Lexer->addSpecialPattern('<slider>', $mode, 'plugin_wiwien_slider');
    }


    /** @inheritDoc */
    public function handle($match, $state, $pos, Doku_Handler $handler)
    {
        $data = [];

        return $data;
    }

    /** @inheritDoc */
    public function render($mode, Doku_Renderer $renderer, $data)
    {
        if ($mode !== 'xhtml') {
            return false;
        }

        $id = md5(random_bytes(10));

        $renderer->doc .= '<div class="wiwien-slider">';
        $renderer->doc .= '<input type="range" list="wiwien__slider_'.$id.'" min="0" max="100">';
        $renderer->doc .= '<datalist id="wiwien__slider_'.$id.'">';
        $renderer->doc .= '<option value="0" label="Chance">';
        $renderer->doc .= '<option value="25" label="Eher Chance">';
        $renderer->doc .= '<option value="50" label="Neutral">';
        $renderer->doc .= '<option value="75" label="Eher Risiko">';
        $renderer->doc .= '<option value="100" label="Risiko">';
        $renderer->doc .= '</datalist>';
        $renderer->doc .= '</div>';

        return true;
    }
}
