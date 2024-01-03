<?php

use Symfony\Component\Yaml\Exception\ParseException;
use Symfony\Component\Yaml\Yaml;

/**
 * DokuWiki Plugin wiwien (Syntax Component)
 *
 * @license GPL 2 http://www.gnu.org/licenses/gpl-2.0.html
 * @author  Andreas Gohr <gohr@cosmocode.de>
 */
class syntax_plugin_wiwien_expert extends \dokuwiki\Extension\SyntaxPlugin
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
        return 155;
    }

    /** @inheritDoc */
    public function connectTo($mode)
    {
        $this->Lexer->addSpecialPattern('<wiwien-expert>.+?</wiwien-expert>', $mode, 'plugin_wiwien_expert');
    }


    /** @inheritDoc */
    public function handle($match, $state, $pos, Doku_Handler $handler)
    {
        require_once __DIR__ . '/../vendor/autoload.php';

        // parse yaml
        $yaml = substr($match, 15, -16);
        try {
            $data = Yaml::parse($yaml);
        } catch (ParseException $e) {
            msg($e->getMessage(), -1);
            return [];
        }

        // render wiki text
        $info = [];
        $data['result'] = p_render('xhtml', p_get_instructions($data['result'] ?? '') , $info);
        foreach ($data['pages'] as &$page) {
            $info = [];
            $page['q'] = p_render('xhtml', p_get_instructions($page['q'] ?? '') , $info);
        }

        return $data;
    }

    /** @inheritDoc */
    public function render($mode, Doku_Renderer $renderer, $data)
    {
        if ($mode !== 'xhtml') {
            return false;
        }

        $renderer->doc .= sprintf(
            '<wiwien-expert base="%s" json="%s"></wiwien-expert>',
            DOKU_BASE . 'lib/plugins/wiwien/',
            hsc(json_encode($data))
        );

        return true;
    }
}

