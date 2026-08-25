//asegurar que los datos recibidos en la api sean correctos antes de guardar
using FluentValidation;
using TaskService.Application.DTOs;

namespace TaskService.Application.Validators;

public class CreateTaskDtoValidator : AbstractValidator<CreateTaskDto>
{
    public CreateTaskDtoValidator()
    {
        RuleFor(x => x.Title).NotEmpty().WithMessage("El título es obligatorio.").MaximumLength(150);
        RuleFor(x => x.Description).MaximumLength(1000);
        RuleFor(x => x.Status).Must(s => Enum.TryParse<Domain.Enums.TaskStatus>(s, true, out _))
            .WithMessage("Estado no válido (ToDo, InProgress, Pending, Completed).");
    }
}

public class UpdateTaskDtoValidator : AbstractValidator<UpdateTaskDto>
{
    public UpdateTaskDtoValidator()
    {
        RuleFor(x => x.Title).NotEmpty().WithMessage("El titulo es necesario").MaximumLength(120);
        RuleFor(x => x.Description).MaximumLength(1000);
        RuleFor(x => x.Status).Must(s => Enum.TryParse<Domain.Enums.TaskStatus>(s, true, out _)).WithMessage("Estado no valido (ToDo, InProgress, Pending, Completed)" );
    }
}

public class CreateTagDtoValidator : AbstractValidator<CreateTagDto>
{
    public CreateTagDtoValidator()
    {
        RuleFor(x => x.Name).NotEmpty().WithMessage("Nombre obligatorio.").MaximumLength(50);
        RuleFor(x => x.Color).NotEmpty().Matches(@"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")
            .WithMessage("Color debe ser hexadecimal válido (ej. #fff).");
    }
}
