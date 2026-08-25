using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using TaskService.Application.DTOs;
using TaskService.Application.Interfaces;

namespace TaskService.Api.Controllers;

[ApiController]
[Route("api/tags")]
public class TagsController : ControllerBase
{
    private readonly ITaskService _taskService;
    private readonly IValidator<CreateTagDto> _createTagValidator;

    public TagsController(ITaskService taskService, IValidator<CreateTagDto> createTagValidator)
    {
        _taskService = taskService;
        _createTagValidator = createTagValidator;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TagDto>>> GetAllTags()
    {
        var tags = await _taskService.GetAllTagsAsync();
        return Ok(tags);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TagDto>> GetTagById(Guid id)
    {
        var tag = await _taskService.GetTagByIdAsync(id);
        if (tag == null)
        {
            return NotFound("Etiqueta no encontrada.");
        }
        return Ok(tag);
    }

    [HttpPost]
    public async Task<ActionResult<TagDto>> CreateTag([FromBody] CreateTagDto dto)
    {
        var validationResult = await _createTagValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.Errors.Select(e => e.ErrorMessage));
        }

        var createdTag = await _taskService.CreateTagAsync(dto);
        return CreatedAtAction(nameof(GetTagById), new { id = createdTag.Id }, createdTag);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteTag(Guid id)
    {
        var deleted = await _taskService.DeleteTagAsync(id);
        if (!deleted)
        {
            return NotFound("Etiqueta no encontrada.");
        }
        return NoContent();
    }
}

